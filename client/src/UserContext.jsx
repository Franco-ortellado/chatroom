import axios from 'axios';
import {createContext, useEffect, useState} from 'react';

export const UserConstext = createContext({});

export function UserContextProvider({children}) {
	const [username, setUsername] = useState(null);
	const [id, setId] = useState(null);

	useEffect(() => {
		axios.get('/profile').then((res) => {
			setId(res.data.userId);
			setUsername(res.data.username);
		});
	});

	return (
		<UserConstext.Provider value={{username, setUsername, id, setId}}>
			{children}
		</UserConstext.Provider>
	);
}
