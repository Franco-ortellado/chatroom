import React, {useContext, useState} from 'react';
import axios from 'axios';
import {UserConstext} from './UserContext';

function RegisterAndLoginForm() {
	const [username, setUsername] = useState('');

	const [password, setPassword] = useState('');

	const [isLoginOrRegister, setIsLoginOrRegister] = useState('Login');

	const {setUsername: setLoggedInUsername, setId} = useContext(UserConstext);

	async function handleSubmit(e) {
		e.preventDefault();

		const url = isLoginOrRegister === 'Register' ? 'Register' : 'Login';

		const {data} = await axios.post(`/${url}`, {username, password});

		setLoggedInUsername(username);
		setId(data.id);
	}

	return (
		<div className="bg-violet-50 h-screen flex items-center">
			<form className="w-64 mx-auto mb-20" onSubmit={handleSubmit}>
				<input
					value={username}
					onChange={(event) => setUsername(event.target.value)}
					type="text"
					placeholder="username"
					className="w-full rounded-sm p-2 mb-2 border"
				/>
				<input
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					type="password"
					placeholder="password"
					className="w-full rounded-sm p-2 mb-2 border"
				/>
				<button className="bg-violet-500 p-2 text-white w-full rounded-sm">
					{isLoginOrRegister}
				</button>
				<div className="text-center mt-2">
					{isLoginOrRegister === 'Register' && (
						<div>
							Already a member?
							<button
								className="ml-1 text-violet-400"
								onClick={() => setIsLoginOrRegister('Login')}
							>
								Login here
							</button>
						</div>
					)}
					{isLoginOrRegister === 'Login' && (
						<div>
							Dont have a account?
							<button
								className="ml-1 text-violet-400"
								onClick={() => setIsLoginOrRegister('Register')}
							>
								Register
							</button>
						</div>
					)}
				</div>
			</form>
		</div>
	);
}

export default RegisterAndLoginForm;
