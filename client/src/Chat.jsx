import {useContext, useEffect, useState, useRef} from 'react';
import Avatar from './Avatar';
import {UserConstext, UserContextProvider} from './UserContext';
import Logo from './Logo';
import {uniqBy} from 'lodash';
import axios from 'axios';
import Contacts from './Contacts';

function Chat() {
	const [ws, setWs] = useState(null);
	const [onlinePeople, setOnlinePeople] = useState({});
	const [offlinePeople, setOfflinePeople] = useState({});
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [newMessageText, setNewMessageText] = useState('');
	const [messages, setMessages] = useState([]);

	const {username, id, setId, setUsername} = useContext(UserConstext);

	const divUnderMessages = useRef();

	useEffect(() => {
		connectToWs();
	}, []);

	useEffect(() => {
		if (selectedUserId) {
			axios.get('/messages/' + selectedUserId).then((res) => {
				setMessages(res.data);
			});
		}
	}, [selectedUserId]);

	function connectToWs() {
		const ws = new WebSocket('ws://localhost:4040');
		setWs(ws);
		ws.addEventListener('message', handleMessage);
		ws.addEventListener('close', () => {
			setTimeout(() => {
				console.log('Disconnected...Trying to reconnect');
				connectToWs();
			}, 1000);
		});
	}

	function showOnlinePeople(peoplearr) {
		const people = {};
		peoplearr.forEach(({userId, username}) => {
			people[userId] = username;
		});
		setOnlinePeople(people);
	}

	function handleMessage(e) {
		const messageData = JSON.parse(e.data);
		console.log({e, messageData});

		if ('online' in messageData) {
			showOnlinePeople(messageData.online);
		} else if ('text' in messageData) {
			if (messageData.sender === selectedUserId) {
				setMessages((prev) => [...prev, {...messageData}]);
			}
		}
	}

	function logout() {
		axios.post('/logout').then(() => {
			setWs(null);
			setId(null);
			setUsername(null);
		});
	}

	function sendMessage(e, file = null) {
		if (e) e.preventDefault();

		if (!selectedUserId) return;

		ws.send(
			JSON.stringify({
				message: {
					recipient: selectedUserId,
					text: newMessageText,
					file,
				},
			})
		);

		if (file) {
			axios.get('/messages/' + selectedUserId).then((res) => {
				setMessages(res.data);
			});
		} else {
			setNewMessageText('');
			setMessages((prev) => [
				...prev,
				{
					text: newMessageText,
					sender: id,
					recipient: selectedUserId,
					_id: Date.now(),
				},
			]);
		}
	}

	function sendFile(e) {
		const reader = new FileReader();
		reader.readAsDataURL(e.target.files[0]);
		reader.onload = () => {
			sendMessage(null, {
				name: e.target.files[0].name,
				data: reader.result,
			});
		};
	}

	useEffect(() => {
		const div = divUnderMessages.current;
		if (div) {
			div.scrollIntoView({behavioe: 'smooth', block: 'end'});
		}
	}, [messages]);

	useEffect(() => {
		axios.get('./people').then((res) => {
			const offlinePeopleArr = res.data
				.filter((p) => p._id !== id)
				.filter((p) => !Object.keys(onlinePeople).includes(p._id));
			const offlinePeople = {};
			offlinePeopleArr.forEach((p) => {
				offlinePeople[p._id] = p;
			});
			setOfflinePeople(offlinePeople);
		});
	}, [onlinePeople]);

	const onlinePeopleFilterOurUser = {...onlinePeople};
	delete onlinePeopleFilterOurUser[id];

	const messagesWithoutDupes = uniqBy(messages, '_id');

	return (
		<div className="flex h-screen ">
			<div className="bg-white-100 w-1/3 flex flex-col">
				<div className="flex-grow">
					<Logo />
					{Object.keys(onlinePeopleFilterOurUser).map((userId) => (
						<Contacts
							key={userId}
							id={userId}
							username={onlinePeopleFilterOurUser[userId]}
							onClick={() => setSelectedUserId(userId)}
							selected={userId == selectedUserId}
							online={true}
						/>
					))}
					{Object.keys(offlinePeople).map((userId) => (
						<Contacts
							key={userId}
							id={userId}
							username={offlinePeople[userId].username}
							onClick={() => setSelectedUserId(userId)}
							selected={userId == selectedUserId}
							online={false}
						/>
					))}
				</div>
				<div className="p-2 text-center flex items-center justify-center">
					<span className="mr-2 text-sm text-gray-550 flex items-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="w-5 h-5"
						>
							<path
								fillRule="evenodd"
								d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
								clipRule="evenodd"
							/>
						</svg>

						{username}
					</span>
					<button
						onClick={logout}
						className="text-sm bg-blue-100 py-1 px-2 border rounded-full text-gray-500"
					>
						logout
					</button>
				</div>
			</div>
			<div className="flex flex-col bg-blue-50 w-2/3 p-2">
				<div className="flex-grow">
					{!selectedUserId && (
						<div className="flex h-full flex-grow items-center justify-center">
							<div className="text-gray-400">
								&larr; Select a User from sidebar
							</div>
						</div>
					)}
					{!!selectedUserId && (
						<div className="relative h-full">
							<div className=" overflow-y-scroll absolute top-0 right-0 bottom-2 w-full">
								{messagesWithoutDupes.map((m) => (
									<div
										key={m._id}
										className={
											m.sender === id
												? 'text-right'
												: 'text-left'
										}
									>
										<div
											className={
												'text-left inline-block p-2 m-2 rounded-md text-sm ' +
												(m.sender === id
													? 'bg-blue-500 text-white'
													: 'bg-white text-gray-500')
											}
										>
											{m.text}
											{m.file && (
												<div>
													<a
														target="_blank"
														className="flex items-center gap-1 underline"
														href={
															axios.defaults
																.baseURL +
															'/uploads/' +
															m.file
														}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth="1.5"
															stroke="currentColor"
															className="w-4 h-4"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
															/>
														</svg>
														{m.file}
													</a>
												</div>
											)}
										</div>
									</div>
								))}
								<div className="" ref={divUnderMessages}></div>
							</div>
						</div>
					)}
				</div>
				{!!selectedUserId && (
					<form className="flex gap-2" onSubmit={sendMessage}>
						<input
							type="text"
							value={newMessageText}
							onChange={(e) => setNewMessageText(e.target.value)}
							placeholder="Type your message here"
							className="bg-white border p-2 flex-grow rounded"
						/>
						<label className="bg-gray-300 p-2 text-white rounded-md cursor-pointer">
							<input
								type="file"
								className="hidden"
								onChange={sendFile}
							/>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
								/>
							</svg>
						</label>
						<button
							type="submit"
							className="bg-blue-500 p-2 text-white rounded-md"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="1.5"
								stroke="currentColor"
								className="w-6 h-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
								/>
							</svg>
						</button>
					</form>
				)}
			</div>
		</div>
	);
}

export default Chat;
