import logger from '../logger';
import BaseBroker from './sfu-base-broker';
import WebRtcPeer from './peer';

const ON_ICE_CANDIDATE_MSG = 'onIceCandidate';
const SUBSCRIBER_ANSWER = 'subscriberAnswer';
const STOP = 'stop';

const SFU_COMPONENT_NAME = 'video';

class VideoBroker extends BaseBroker {
  constructor(role, options = {}) {
    super(SFU_COMPONENT_NAME, { wsUrl: options.wsUrl, ws: options.ws });
    this.role = role;
    this.offering = true;

    // Optional parameters are:
    // cameraId
    // iceServers,
    // offering,
    // mediaServer,
    // extension,
    // constraints,
    // stream,
    // signalCandidates
    // traceLogs
    Object.assign(this, options);
  }

  getLocalStream() {
    if (this.webRtcPeer && typeof this.webRtcPeer.getLocalStream === 'function') {
      return this.webRtcPeer.getLocalStream();
    }

    return null;
  }

  getRemoteStream() {
    if (this.webRtcPeer && typeof this.webRtcPeer.getRemoteStream === 'function') {
      return this.webRtcPeer.getRemoteStream();
    }

    return null;
  }

  setLocalStream(stream) {
    if (this.webRtcPeer == null || this.webRtcPeer.peerConnection == null) {
      throw new Error('Missing peer connection');
    }

    const { peerConnection } = this.webRtcPeer;
    const newTracks = stream.getVideoTracks();
    const localStream = this.getLocalStream();
    const oldTracks = localStream ? localStream.getVideoTracks() : [];

    peerConnection.getSenders().forEach((sender, index) => {
      if (sender.track && sender.track.kind === 'video') {
        const newTrack = newTracks[index];
        if (newTrack == null) return;

        // Cleanup old tracks in the local MediaStream
        const oldTrack = oldTracks[index];
        sender.replaceTrack(newTrack);
        if (oldTrack) {
          oldTrack.stop();
          localStream.removeTrack(oldTrack);
        }
        localStream.addTrack(newTrack);
      }
    });

    return Promise.resolve();
  }

  _join() {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          videoStream: this.stream,
          mediaConstraints: {
            audio: false,
            video: this.constraints ? this.constraints : true,
          },
          configuration: this.populatePeerConfiguration(),
          onicecandidate: !this.signalCandidates ? null : (candidate) => {
            this.onIceCandidate(candidate, this.role);
          },
          trace: this.traceLogs,
        };

        const peerRole = this.role === 'share' ? 'sendonly' : 'recvonly';
        this.webRtcPeer = new WebRtcPeer(peerRole, options);
        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.start();
        this.webRtcPeer.peerConnection.onconnectionstatechange = this.handleConnectionStateChange.bind(this);

        if (this.offering) {
          this.webRtcPeer.generateOffer()
            .then(this.sendStartReq.bind(this))
            .catch(this._handleOfferGenerationFailure.bind(this));
        } else {
          this.sendStartReq();
        }

        resolve();
      } catch (error) {
        // 1305: "PEER_NEGOTIATION_FAILED",
        const normalizedError = BaseBroker.assembleError(1305);
        logger.error({
          logCode: `${this.logCodePrefix}_peer_creation_failed`,
          extraInfo: {
            errorMessage: error.name || error.message || 'Unknown error',
            errorCode: normalizedError.errorCode,
            sfuComponent: this.sfuComponent,
            started: this.started,
          },
        }, 'Video peer creation failed');
        this.onerror(normalizedError);
        reject(normalizedError);
      }
    });
  }

  joinVideo() {
    return this.openWSConnection()
      .then(this._join.bind(this));
  }

  onWSMessage(message) {
    const parsedMessage = JSON.parse(message.data);

    // Not for me. Skip.
    if (parsedMessage.cameraId !== this.cameraId) return;

    switch (parsedMessage.id) {
      case 'startResponse':
        this.onRemoteDescriptionReceived(parsedMessage);
        break;
      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage.candidate);
        break;
      case 'playStart':
        this.onstart(parsedMessage);
        this.started = true;
        break;
      case 'stop':
        this.stop();
        break;
      case 'error':
        this.handleSFUError(parsedMessage);
        break;
      case 'pong':
        break;
      default:
        logger.debug({
          logCode: `${this.logCodePrefix}_invalid_req`,
          extraInfo: { messageId: parsedMessage.id || 'Unknown', sfuComponent: this.sfuComponent },
        }, 'Discarded invalid SFU message');
    }
  }

  handleSFUError(sfuResponse) {
    const { code, reason, role } = sfuResponse;
    const error = BaseBroker.assembleError(code, reason);

    logger.error({
      logCode: `${this.logCodePrefix}_sfu_error`,
      extraInfo: {
        errorCode: code,
        errorMessage: error.errorMessage,
        role,
        sfuComponent: this.sfuComponent,
        started: this.started,
      },
    }, 'Video failed in SFU');
    this.onerror(error);
  }

  sendLocalDescription(localDescription) {
    const message = {
      id: SUBSCRIBER_ANSWER,
      type: this.sfuComponent,
      role: this.role,
      cameraId: this.cameraId,
      answer: localDescription,
    };

    this.sendMessage(message);
  }


  onRemoteDescriptionReceived(sfuResponse) {
    if (sfuResponse.cameraId !== this.cameraId) return;

    if (this.offering) {
      return this.processAnswer(sfuResponse);
    }

    return this.processOffer(sfuResponse);
  }

  sendStartReq(offer) {
    const message = {
      id: 'start',
      type: this.sfuComponent,
      role: this.role,
      cameraId: this.cameraId,
      sdpOffer: offer,
      mediaServer: this.mediaServer,
    };

    logger.debug({
      logCode: `${this.logCodePrefix}_offer_generated`,
      extraInfo: { sfuComponent: this.sfuComponent, role: this.role },
    }, 'SFU video offer generated');

    this.sendMessage(message);
  }

  _handleOfferGenerationFailure(error) {
    if (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_offer_failure`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          sfuComponent: this.sfuComponent,
        },
      }, 'Video offer generation failed');
      // 1305: "PEER_NEGOTIATION_FAILED",
      this.onerror(error);
    }
  }

  onIceCandidate(candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      cameraId: this.cameraId,
      candidate,
    };

    this.sendMessage(message);
  }

  _stop() {
    const message = {
      id: STOP,
      role: this.role,
      type: this.sfuComponent,
      cameraId: this.cameraId,
    };

    this.sendMessage(message);
  }
}

export default VideoBroker;
