import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { EventEmitter2 } from 'eventemitter2';
import {
  stopStream,
  silentConsole,
} from './utils';

export default class WebRtcPeer extends EventEmitter2 {
  constructor(mode, options = {}) {
    super({ newListener: true });

    this.mode = mode;
    this.options = options;
    this.candidateGatheringDone = false;
    this.peerConnection = this.options.peerConnection;
    this.videoStream = this.options.videoStream;
    this.audioStream = this.options.audioStream;
    this.mediaConstraints = this.options.mediaConstraints;
    this.trace = this.options.trace;
    this.configuration = this.options.configuration;
    this.onicecandidate = this.options.onicecandidate;
    this.oncandidategatheringdone = this.options.oncandidategatheringdone;
    this.onconnectionstatechange = this.options.onconnectionstatechange;
    this.oniceconnectionstatechange = this.options.oniceconnectionstatechange;
    this.appData = this.options.appData;
    this.logger = this.options.logger || WebRtcPeer.internalLogger();
    this._logMetadata = this.options?.appData?.logMetadata ?? {};

    this._outboundCandidateQueue = [];
    this._inboundCandidateQueue = [];
    this._handleIceCandidate = this._handleIceCandidate.bind(this);
    this._handleSignalingStateChange = this._handleSignalingStateChange.bind(this);
    this._handleIceConnectionStateChange = this._handleIceConnectionStateChange.bind(this);
    this._handleConnectionStateChange = this._handleConnectionStateChange.bind(this);

    this._assignOverrides();
  }

  static shimmedLogger(level, msg, metadata = {}) {
    console[level](msg, metadata);
  }

  static internalLogger() {
    return {
      info: (metadata, msg) => WebRtcPeer.shimmedLogger('info', msg, metadata),
      log: (metadata, msg) => WebRtcPeer.shimmedLogger('log', msg, metadata),
      warn: (metadata, msg) => WebRtcPeer.shimmedLogger('warn', msg, metadata),
      debug: (metadata, msg) => WebRtcPeer.shimmedLogger('debug', msg, metadata),
      error: (metadata, msg) => WebRtcPeer.shimmedLogger('error', msg, metadata),
    };
  }

  _assignOverrides() {
    if (typeof this.onicecandidate === 'function') {
      this.on('icecandidate', this.onicecandidate);
    }
    if (typeof this.oncandidategatheringdone === 'function') {
      this.on('candidategatheringdone', this.oncandidategatheringdone);
    }
    if (typeof this.onconnectionstatechange === 'function') {
      this.on('connectionstatechange', this.onconnectionstatechange);
    }
    if (typeof this.oniceconnectionstatechange === 'function') {
      this.on('iceconnectionstatechange', this.oniceconnectionstatechange);
    }
    if (typeof this.options.mediaStreamFactory === 'function') {
      this.mediaStreamFactory = this.options.mediaStreamFactory.bind(this);
    }
  }

  _flushInboundCandidateQueue() {
    while (this._inboundCandidateQueue.length) {
      const entry = this._inboundCandidateQueue.shift();
      if (entry.candidate && entry.promise) {
        try {
          if (this.isPeerConnectionClosed()) {
            entry.promise.resolve();
          } else {
            this.peerConnection.addIceCandidate(entry.candidate)
              .then(entry.promise.resolve)
              .catch(entry.promise.reject);
          }
        } catch (error) {
          entry.promise.reject(error);
        }
      }
    }
  }

  _trackQueueFlushEvents() {
    this.on('newListener', (event) => {
      if (event === 'icecandidate' || event === 'candidategatheringdone') {
        while (this._outboundCandidateQueue.length) {
          const candidate = this._outboundCandidateQueue.shift();

          if (!candidate) this._emitCandidateGatheringDone();
        }
      }
    });

    this.peerConnection?.addEventListener('signalingstatechange', this._handleSignalingStateChange);
  }

  _emitCandidateGatheringDone() {
    if (!this.candidateGatheringDone) {
      this.emit('candidategatheringdone');
      this.candidateGatheringDone = true;
    }
  }

  _handleIceCandidate({ candidate }) {
    if (this.hasListeners('icecandidate') || this.hasListeners('candidategatheringdone')) {
      if (candidate) {
        this.emit('icecandidate', candidate);
        this.candidateGatheringDone = false;
      } else this._emitCandidateGatheringDone();
    } else if (!this.candidateGatheringDone) {
      this._outboundCandidateQueue.push(candidate);
      if (!candidate) this.candidateGatheringDone = true;
    }
  }

  _handleSignalingStateChange() {
    const signalingState = this.peerConnection?.signalingState || 'closed';

    if (signalingState === 'stable') this._flushInboundCandidateQueue();

    this.logger.debug({
      logCode: 'BBB::WebRtcPeer::signalingstatechange',
      extraInfo: { ...this._logMetadata, signalingState },
    }, `BBB::WebRtcPeer::signalingstatechange ${signalingState}`);
    this.emit('signalingstatechange', signalingState);
  }

  _handleIceConnectionStateChange() {
    const iceConnectionState = this.peerConnection?.iceConnectionState || 'closed';
    this.logger.debug({
      logCode: 'BBB::WebRtcPeer::oniceconnectionstatechange',
      extraInfo: { ...this._logMetadata, iceConnectionState },
    }, `BBB::WebRtcPeer::oniceconnectionstatechange, ${iceConnectionState}`);
    this.emit('iceconnectionstatechange', iceConnectionState);
  }

  _handleConnectionStateChange() {
    const connectionState = this.peerConnection?.connectionState || 'closed';
    this.logger.debug({
      logCode: 'BBB::WebRtcPeer::onconnectionstatechange',
      extraInfo: { ...this._logMetadata, connectionState },
    }, `BBB::WebRtcPeer::onconnectionstatechange ${connectionState}`);
    this.emit('connectionstatechange', connectionState);
  }

  // Public method can be overriden via options
  mediaStreamFactory() {
    if (this.videoStream || this.audioStream) {
      return Promise.resolve();
    }

    // eslint-disable-next-line no-undef
    return navigator.mediaDevices.getUserMedia(this.mediaConstraints).then((stream) => {
      if (stream.getAudioTracks().length > 0) {
        this.audioStream = stream;
      }
      if (stream.getVideoTracks().length > 0) {
        this.videoStream = stream;
      }
    }).catch((error) => {
      this.logger.error({
        logCode: 'BBB::WebRtcPeer::mediaStreamFactory::gUMFailed',
        extraInfo: {
          ...this._logMetadata,
          videoStream: !!this.videoStream,
          audioStream: !!this.audioStream,
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `BBB::WebRtcPeer::mediaStreamFactory - gUM failed: ${error.name || error.message}`);
      throw error;
    });
  }

  set peerConnection(pc) {
    this._pc = pc;
  }

  get peerConnection() {
    return this._pc;
  }

  set logger(_logger) {
    this._logger = _logger;
  }

  get logger() {
    if (this.trace) return this._logger
    return silentConsole;
  }

  getLocalSessionDescriptor() {
    return this.peerConnection?.localDescription;
  }

  getRemoteSessionDescriptor() {
    return this.peerConnection?.remoteDescription;
  }

  getLocalStream() {
    if (this.localStream) {
      return this.localStream;
    }

    if (this.peerConnection) {
      this.localStream = this.peerConnection.getLocalStreams()[0];
    }

    return this.localStream;
  }

  getRemoteStream() {
    if (this.remoteStream) {
      return this.remoteStream;
    }

    if (this.peerConnection) {
      this.remoteStream = this.peerConnection.getRemoteStreams()[0];
    }

    return this.remoteStream;
  }

  isPeerConnectionClosed() {
    return !this.peerConnection || this.peerConnection.signalingState === 'closed';
  }

  _trackPCEvents() {
    if (this.peerConnection) {
      this.peerConnection.addEventListener('icecandidate', this._handleIceCandidate);
      this.peerConnection.addEventListener('iceconnectionstatechange', this._handleIceConnectionStateChange);
      this.peerConnection.addEventListener('connectionstatechange', this._handleConnectionStateChange);
    }
  }

  start() {
    // Init PeerConnection
    if (!this.peerConnection) {
      this.peerConnection = new RTCPeerConnection();
      this.peerConnection.setConfiguration(this.configuration);
    }

    if (this.isPeerConnectionClosed()) {
      this.logger.debug({
        logCode: 'BBB::WebRtcPeer::start::closed',
        extraInfo: this._logMetadata,
      }, 'BBB::WebRtcPeer::start - Peer connection closed');
      throw new Error('Invalid peer state: closed');
    }

    this._trackPCEvents();
    this._trackQueueFlushEvents();
  }

  addIceCandidate(iceCandidate) {
    const candidate = new RTCIceCandidate(iceCandidate);

    switch (this.peerConnection?.signalingState) {
      case 'closed':
        throw new Error('PeerConnection object is closed');
      case 'stable': {
        if (this.peerConnection.remoteDescription) {
          return this.peerConnection.addIceCandidate(candidate);
        }
      }
      // eslint-ignore-next-line no-fallthrough
      default: {
        const promise = new Promise();
        this._inboundCandidateQueue.push({
          candidate,
          promise,
        });
        return promise;
      }
    }
  }

  async generateOffer() {
    let sessionConstraints;

    switch (this.mode) {
      case 'recvonly': {
        const useAudio = this.mediaConstraints
        && ((typeof this.mediaConstraints.audio === 'boolean' && this.mediaConstraints.audio)
          || (typeof this.mediaConstraints.audio === 'object'));
        const useVideo = this.mediaConstraints
        && ((typeof this.mediaConstraints.video === 'boolean' && this.mediaConstraints.video)
          || (typeof this.mediaConstraints.video === 'object'));

        sessionConstraints = {
          mandatory: {
            OfferToReceiveAudio: useAudio,
            OfferToReceiveVideo: useVideo,
          }
        };

        break;
      }

      case 'sendonly':
      case 'sendrecv': {
        await this.mediaStreamFactory();

        if (this.videoStream) {
          this.peerConnection.addStream(this.videoStream);
        }

        if (this.audioStream) {
          this.peerConnection.addStream(this.audioStream);
        }

        break;
      }

      default:
        break;
    }

    return this.peerConnection.createOffer(sessionConstraints)
      .then((offer) => {
        this.logger.debug({
          logCode: 'BBB::WebRtcPeer::generateOffer::createOffer',
          extraInfo: this._logMetadata,
        }, 'BBB::WebRtcPeer::generateOffer - Offer created');

        return this.peerConnection.setLocalDescription(
          new RTCSessionDescription(offer),
        );
      })
      .then(() => {
        const localDescription = this.getLocalSessionDescriptor();
        this.logger.debug({
          logCode: 'BBB::WebRtcPeer::generateOffer::setLocalDescription',
          extraInfo: this._logMetadata,
        }, 'BBB::WebRtcPeer::generateOffer - Local description set');

        return localDescription.sdp;
      });
  }

  processAnswer(sdp) {
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp,
    });

    if (this.isPeerConnectionClosed()) {
      this.logger.error({
        logCode: 'BBB::WebRtcPeer::processAnswer::closed',
        extraInfo: this._logMetadata,
      }, 'BBB::WebRtcPeer::processAnswer - Peer connection closed');

      throw new Error('Peer connection is closed');
    }

    return this.peerConnection.setRemoteDescription(answer).then(() => {
      this.logger.info({
        logCode: 'BBB::WebRtcPeer::processAnswer::setRemoteDescription',
        extraInfo: { ...this._logMetadata },
      }, 'BBB::WebRtcPeer::processAnswer - Remote description set');
    }).catch((error) => {
      this.logger.error({
        logCode: 'BBB::WebRtcPeer::processAnswer::setRemoteDescription::failed',
        extraInfo: {
          ...this._logMetadata,
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `BBB::WebRtcPeer::processAnswer::setRemoteDescription - failed = ${error.message || error.name}`);

      throw error;
    });
  }

  processOffer(sdp) {
    const offer = new RTCSessionDescription({
      type: 'offer',
      sdp,
    });

    if (this.isPeerConnectionClosed()) {
      this.logger.error({
        logCode: 'BBB::WebRtcPeer::processOffer::closed',
        extraInfo: this._logMetadata,
      }, 'BBB::WebRtcPeer::processOffer - Peer connection closed');

      throw new Error('Peer connection is closed');
    }

    return this.peerConnection.setRemoteDescription(offer)
      .then(() => {
        this.logger.debug({
          logCode: 'BBB::WebRtcPeer::processOffer::setRemoteDescription',
          extraInfo: this._logMetadata,
        }, 'BBB::WebRtcPeer::processOffer - Remote description set');
        return this.peerConnection.createAnswer();
      })
      .then((answer) => {
        this.logger.debug({
          logCode: 'BBB::WebRtcPeer::processOffer::createAnswer',
          extraInfo: this._logMetadata,
        }, 'BBB::WebRtcPeer::processOffer - Created answer');

        return this.peerConnection.setLocalDescription(
          new RTCSessionDescription(answer)
        );
      })
      .then(() => {
        const localDescription = this.getLocalSessionDescriptor();
        this.logger.debug({
          logCode: 'BBB::WebRtcPeer::processOffer::setLocalDescription',
          extraInfo: this._logMetadata,
        }, 'BBB::WebRtcPeer::processOffer - Local description set');

        return localDescription.sdp;
      });
  }

  dispose({ preserveLocalStream = false }) {
    this.logger.debug({
      logCode: 'BBB::WebRtcPeer::dispose',
      extraInfo: this._logMetadata
    }, 'BBB::WebRtcPeer::dispose');

    try {
      if (this.peerConnection) {
        if (!this.isPeerConnectionClosed()) this.peerConnection.close();
        this.peerConnection = null;
      }

      if (this.localStream && !preserveLocalStream) {
        stopStream(this.localStream);
        this.localStream = null;
      }

      if (this.remoteStream) {
        stopStream(this.remoteStream);
        this.remoteStream = null;
      }

      this._outboundCandidateQueue = [];
      this.candidateGatheringDone = false;
    } catch (error) {
      this.logger.error({
        logCode: 'BBB::WebRtcPeer::dispose::failed',
        extraInfo: {
          ...this._logMetadata,
          errorName: error.name,
          errorMessage: error.message,
        },
      }, `Dispose peer failed = ${error.message || error.name}`);
    }

    this.removeAllListeners();
  }
}
