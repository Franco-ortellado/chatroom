let cache = {};

let uploadFile = async (file) => {
	if (cache.imag === file) {
		console.log('el url es:' + img.secure_url);
		return img.secure_url;
	}
	cache.imag = file;

	let data = new FormData();

	data.append('file', file);
	data.append('upload_preset', 'images');
	data.append('api_key', process.env.CLOUDINARY_API_KEY);

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_API_SECRET}/image/upload`,
		{
			method: 'POST',
			body: data,
		}
	);

	let img = await res.json();

	return img.secure_url;
};

export default uploadFile;
