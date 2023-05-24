import RegisterAndLoginForm from './RegisterAndLoginForm';
import {useContext} from 'react';
import {UserConstext} from './UserContext';
import Chat from './Chat';

function Routes() {
	const {username, id} = useContext(UserConstext);

	if (username) {
		return <Chat />;
	}

	return <RegisterAndLoginForm />;
}

export default Routes;
