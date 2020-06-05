import React, { SyntheticEvent } from "react";
import ExpandLessOutlinedIcon from "@material-ui/icons/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@material-ui/icons/ExpandMoreOutlined";

export interface ISubHeaderCreateProps {
  id: number;
  content: string;
  updateBlockContent: (id: number, newcontent: string, isCaption: boolean) => void;
  deleteBlock: (id: number) => void;
  moveBlockUp: (id: number) => void;
  moveBlockDown: (id: number) => void;
}

const SubHeaderCreate: React.FC<ISubHeaderCreateProps> = (props) => {
  const {
    id,
    content,
    updateBlockContent,
    deleteBlock,
    moveBlockUp,
    moveBlockDown,
  } = props;

  const onTextChangeHandler = (id: number, e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement;
    const text = target.value;
    updateBlockContent(id, text, false);
  };

  return (
    <div className='createArticleBlock'>
      <input
        id='createArticleSubHeading'
        placeholder='Enter subheading here'
        value={content}
        onChange={(e) => {
          onTextChangeHandler(id, e);
        }}
      />
      <p style={{ top: "20px" }} onClick={() => deleteBlock(id)} id='blockDelete'>
        x
      </p>
      <ExpandLessOutlinedIcon
        style={{ color: "grey", top: "31px" }}
        className='blockMove'
        onClick={() => {
          moveBlockUp(id);
        }}
      />
      <ExpandMoreOutlinedIcon
        style={{ color: "grey", top: "61px" }}
        className='blockMove'
        onClick={() => {
          moveBlockDown(id);
        }}
      />
    </div>
  );
};

export default SubHeaderCreate;
