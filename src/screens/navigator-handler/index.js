import LoadingScreen from '../loading-screen';
import useJoinMeeting from '../../graphql/hooks/use-join-meeting';
import MainNavigator from './main-navigator';
import TransferNavigator from './transfer-navigator';

const NavigatorHandler = (props) => {
  const { joinURL } = props;
  const joinObject = useJoinMeeting(joinURL);

  const {
    graphqlUrlApolloClient,
    loginStage,
  } = joinObject;

  switch (loginStage) {
    case 5:
      return (<MainNavigator
        {...props}
        graphqlUrlApolloClient={graphqlUrlApolloClient}
      />)
    case 6:
      return (<TransferNavigator {...props} />)
    default:
      return (<LoadingScreen />)
  }
};

export default NavigatorHandler;
