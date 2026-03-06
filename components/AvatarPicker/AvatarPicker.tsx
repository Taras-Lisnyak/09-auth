import Image from 'next/image';
import { ChangeEvent, useState } from 'react';
import css from './AvatarPicker.module.css';

type Props = {
  onChangePhoto: (file: File | null) => void;
  profilePhotoUrl?: string;
};

const AvatarPicker = ({ profilePhotoUrl, onChangePhoto }: Props) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [error, setError] = useState('');
  const displayUrl = isRemoved ? '' : previewUrl ?? profilePhotoUrl ?? '';

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Only images');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size 5MB');
        return;
      }

      onChangePhoto(file);
      setIsRemoved(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChangePhoto(null);
    setPreviewUrl(null);
    setIsRemoved(true);
  };

  return (
    <div>
      <div className={css.picker}>
        {displayUrl && (
          <Image
            src={displayUrl}
            alt="Preview"
            width={300}
            height={300}
            className={css.avatar}
          />
        )}
        <label className={displayUrl ? `${css.wrapper} ${css.reload}` : css.wrapper}>
          Choose photo
          <input type="file" accept="image/*" onChange={handleFileChange} className={css.input} />
        </label>
        {displayUrl && (
          <button type="button" className={css.remove} onClick={handleRemove} aria-label="Remove photo">
            x
          </button>
        )}
      </div>
      {error && <p className={css.error}>{error}</p>}
    </div>
  );
};

export default AvatarPicker;
