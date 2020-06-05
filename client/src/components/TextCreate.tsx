import React, { SyntheticEvent } from "react";
import ContentEditable from "react-contenteditable";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

export interface ITextCreateProps {
  id: number;
  content: string;
  updateBlockContent: (id: number, newcontent: string, isCaption: boolean) => void;
  deleteBlock: (id: number) => void;
  moveBlockUp: (id: number) => void;
  moveBlockDown: (id: number) => void;
}

const TextCreate: React.FC<ITextCreateProps> = (props) => {
  const {
    id,
    content,
    updateBlockContent,
    deleteBlock,
    moveBlockDown,
    moveBlockUp,
  } = props;

  const bold = () => {
    document.execCommand("bold");
  };

  const italicize = () => {
    document.execCommand("italic");
  };

  const addLink = () => {
    const res = window.prompt("Enter a link below: ");
    if (res !== null && res.length > 0) {
      document.execCommand("createLink", false, "https://" + res);
    }
  };

  const onTextChangeHandler = (id: number, e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    const text = target.value;
    updateBlockContent(id, text, false);
  };

  return (
    <div className='createArticleBlock'>
      <ContentEditable
        className='createArticleText'
        html={content} // innerHTML of the editable div
        disabled={false} // use true to disable editing
        onChange={(e) => {
          onTextChangeHandler(id, e);
        }} // handle innerHTML change
        tagName='article' // Use a custom HTML tag (uses a div by default)
      />
      <p onClick={() => deleteBlock(id)} id='blockDelete' style={{ top: "-25px" }}>
        x
      </p>
      <ExpandLessOutlinedIcon
        style={{ color: "grey", top: "-14px" }}
        className='blockMove'
        onClick={() => {
          moveBlockUp(id);
        }}
      />
      <ExpandMoreOutlinedIcon
        style={{ color: "grey", top: "16px" }}
        className='blockMove'
        onClick={() => {
          moveBlockDown(id);
        }}
      />
      <button className='textControlButton' style={{ left: "50px" }} onClick={bold}>
        B
      </button>
      <button className='textControlButton' style={{ left: "70px" }} onClick={italicize}>
        I
      </button>
      <button className='textControlButton' style={{ left: "90px" }} onClick={addLink}>
        L
      </button>
    </div>
  );
};

export default TextCreate;
