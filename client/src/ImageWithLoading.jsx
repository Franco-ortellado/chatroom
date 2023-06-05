import {useState} from 'react';
import {ClipLoader} from 'react-spinners';

function ImageWithLoading({src, alt, className}) {
	const [isLoading, setIsLoading] = useState(true);

	const handleImageLoad = () => {
		setIsLoading(false);
	};

	return (
		<div>
			{isLoading && (
				<div className="loader">
					<ClipLoader color="#000" loading={isLoading} />
				</div>
			)}
			<img
				src={src}
				alt={alt}
				className={className}
				style={{display: isLoading ? 'none' : 'block'}}
				onLoad={handleImageLoad}
			/>
		</div>
	);
}

export default ImageWithLoading;
