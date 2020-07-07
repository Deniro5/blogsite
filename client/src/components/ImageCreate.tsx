import React, { SyntheticEvent, useRef, Fragment } from "react";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";
import devMode from "./devmode";

export interface IImageCreateProps {
  id: number;
  content: string;
  caption: string;
  updateBlockContent: (id: number, newcontent: string, isCaption: boolean) => void;
  updateImageFile: (id: number, newFile: File) => void;
  deleteBlock: (id: number) => void;
  isDeletable: boolean;
  moveBlockUp: (id: number) => void;
  moveBlockDown: (id: number) => void;
}

const ImageCreate: React.FC<IImageCreateProps> = (props) => {
  const {
    id,
    content,
    caption,
    updateBlockContent,
    updateImageFile,
    deleteBlock,
    isDeletable,
    moveBlockDown,
    moveBlockUp,
  } = props;
  const uploadRef = useRef<HTMLInputElement>(null);

  const onCaptionChangeHandler = (id: number, e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const text = target.value;
    updateBlockContent(id, text, true);
  };

  const onImageChangeHandler = (id: number) => {
    var reader = new FileReader();
    reader.onload = () => {
      updateBlockContent(id, reader.result!.toString(), false);
    };
    updateImageFile(id, uploadRef.current!.files![0]);
    reader.readAsDataURL(uploadRef.current!.files![0]!);
  };

  return (
    <div className='createArticleBlock'>
      <img alt='articleimage' id='articleMainImg' src={content} />
      <textarea
        id='createArticleImgCaption'
        className='createArticleBlock'
        placeholder='Enter image caption here (Leave blank for no caption)'
        value={caption}
        onChange={(e) => {
          onCaptionChangeHandler(id, e);
        }}
      />
      {isDeletable && (
        <Fragment>
          <p onClick={() => deleteBlock(id)} id='blockDelete'>
            x
          </p>
          <ExpandLessOutlinedIcon
            style={{ color: "grey", top: "105px" }}
            className='blockMove'
            onClick={() => {
              moveBlockUp(id);
            }}
          />
          <ExpandMoreOutlinedIcon
            style={{ color: "grey", top: "130px" }}
            className='blockMove'
            onClick={() => {
              moveBlockDown(id);
            }}
          />
        </Fragment>
      )}
      <img alt='add' id='addImageIcon' src='img/add.png' />
      <input
        onChange={() => {
          onImageChangeHandler(id);
        }}
        ref={uploadRef}
        type='file'
        name='pic'
        accept='image/*'
        id='addImageInput'
      />
    </div>
  );
};

export default ImageCreate;
