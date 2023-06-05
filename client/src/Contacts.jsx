import Avatar from './Avatar';

function Contacts({id, username, onClick, selected, online}) {
	return (
		<div
			key={id}
			onClick={() => {
				onClick(id);
			}}
			className={
				'border-b border-gray-100  flex items-center gap-2 cursor-pointer ' +
				(selected ? 'bg-violet-200' : '')
			}
		>
			{selected && (
				<div className="w-1 bg-violet-500 h-12 rounded-r-md"></div>
			)}
			<div className="flex gap-2 py-2 pl-4 items-center">
				<Avatar online={online} userId={id} username={username} />
				<span className="text-gray-700">{username}</span>
			</div>
		</div>
	);
}

export default Contacts;
