import {useContext, useEffect, useState, useRef} from 'react';
import Avatar from './Avatar';
import {UserConstext, UserContextProvider} from './UserContext';
import Logo from './Logo';
import {uniqBy} from 'lodash';
import axios from 'axios';
import Contacts from './Contacts';
import ImageWithLoading from './ImageWithLoading';
import uploadFile from './inputfile';
import ReactEmoji from 'react-emoji-render';

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

		if ('online' in messageData) {
			showOnlinePeople(messageData.online);
		} else if ('text' in messageData) {
			setMessages((prev) => [...prev, {...messageData}]);
		}
	}

	function logout() {
		axios.post('/logout').then(() => {
			setWs(null);
			setId(null);
			setUsername(null);
			window.location.reload();
		});
	}

	async function sendMessage(e, file = null) {
		if (e) e.preventDefault();

		if (!selectedUserId) return;

		if (file) {
			let theFile = await uploadFile(file);
			ws.send(
				JSON.stringify({
					message: {
						recipient: selectedUserId,
						text: theFile,
					},
				})
			);

			setNewMessageText('');
			setMessages((prev) => [
				...prev,
				{
					text: theFile,
					sender: id,
					recipient: selectedUserId,
					_id: Date.now(),
				},
			]);
		} else {
			ws.send(
				JSON.stringify({
					message: {
						recipient: selectedUserId,
						text: newMessageText,
					},
				})
			);

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

	function isImageLink(text) {
		// Expresión regular para verificar si el texto es un enlace de imagen
		const imageLinkRegex = /\.(jpeg|jpg|gif|png)$/i;
		return imageLinkRegex.test(text);
	}

	useEffect(() => {
		const div = divUnderMessages.current;
		if (div) {
			div.scrollIntoView({behavior: 'smooth', block: 'end'});
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
						className="text-sm m-2 bg-violet-100 py-1 px-2 border rounded-full text-gray-500"
					>
						logout
					</button>
				</div>
			</div>
			<div className="flex flex-col bg-violet-100 w-2/3 p-2">
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
													? 'bg-violet-500 text-white'
													: 'bg-white text-gray-500')
											}
										>
											{isImageLink(m.text) ? (
												<ImageWithLoading
													src={m.text}
													alt="Imagen"
													className="max-w-xs max-h-xs"
												/>
											) : (
												m.text
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
								name="imageorvideo"
								className="hidden"
								// onChange={sendFile}
								onChange={(e) =>
									sendMessage(null, e.target.files[0])
								}
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
									d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
								/>
							</svg>
						</label>
						<button
							type="submit"
							className="bg-violet-500 p-2 text-white rounded-md"
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
