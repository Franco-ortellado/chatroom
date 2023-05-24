function Avatar({userId, username, online}) {
	const colors = [
		'bg-green-200',
		'bg-red-200',
		'bg-purple-200',
		'bg-blue-200',
		'bg-yellow-200',
		'bg-teal-200',
	];

	const userIdBase10 = parseInt(userId, 16);

	const colorIndex = userIdBase10 % colors.length;

	const color = colors[colorIndex];

	return (
		<div
			className={
				'w-8 h-8 relative rounded-full flex items-center ' + color
			}
		>
			<div className="text-center w-full opacity-70 ">{username[0]}</div>
			<div
				className={`absolute w-2.5 h-2.5 bf rounded-full -bottom-0.5 right-0 border border-white shadow-lg shadow-black ${
					online ? 'bg-green-400' : 'bg-gray-400'
				}`}
			></div>
		</div>
	);
}

export default Avatar;
