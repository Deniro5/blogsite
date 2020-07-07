import React, { useState, useEffect, SyntheticEvent, useRef } from "react";
import SubHeaderCreate from "./SubHeaderCreate";
import TextCreate from "./TextCreate";
import ImageCreate from "./ImageCreate";
import { withRouter } from "react-router-dom";
import devMode from "./devmode";

export interface block {
  id: number;
  type: string;
  content: string;
  caption?: string;
  isDeletable?: boolean;
  file?: File;
}

const CreateArticle: React.FC = (props: any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currId, setCurrId] = useState(1);
  const [date, setDate] = useState("");
  const [username, setUsername] = useState("");
  const [userImage, setUserImage] = useState("");
  const [blocks, setBlocks] = useState<block[]>([
    {
      id: 0,
      type: "image",
      content: (devMode ? "http://localhost:8000/" : "/") + "uploads/default.jpg",
      caption: "",
      isDeletable: false,
    },
  ]);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currId !== 1) {
      window.scrollTo(0, document.body.scrollHeight + 200);
    }
  }, [currId]);

  useEffect(() => {
    fetch((devMode ? "http://localhost:8000" : "") + "/users/userprofile", {
      method: "get",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          window.location.reload();
        }
        return res.json();
      })
      .then((json) => {
        const user = json.user;
        setUsername(user.username);
        setUserImage("" + user.userImage);
        // setIsLoaded(true);
        const dateobj = new Date();
        setDate(dateobj.toString().substring(4, 15));
      })
      .catch((error) => alert(error));
  }, []);

  const convertToJsx = (block: block) => {
    if (block.type === "subheader") {
      return (
        <SubHeaderCreate
          id={block.id}
          content={block.content}
          updateBlockContent={updateBlockContent}
          deleteBlock={deleteBlock}
          moveBlockUp={moveBlockUp}
          moveBlockDown={moveBlockDown}
        />
      );
    } else if (block.type === "text") {
      return (
        <TextCreate
          id={block.id}
          content={block.content}
          updateBlockContent={updateBlockContent}
          deleteBlock={deleteBlock}
          moveBlockUp={moveBlockUp}
          moveBlockDown={moveBlockDown}
        />
      );
    } else if (block.type === "image") {
      return (
        <ImageCreate
          id={block.id}
          content={block.content}
          caption={block.caption!}
          updateBlockContent={updateBlockContent}
          updateImageFile={updateImageFile}
          deleteBlock={deleteBlock}
          isDeletable={block.isDeletable!}
          moveBlockUp={moveBlockUp}
          moveBlockDown={moveBlockDown}
        />
      );
    }
  };

  const getBlockIndex = (id: number) => {
    let index = 0;
    for (let block of blocks) {
      if (block.id === id) {
        return index;
      }
      index++;
    }
    return -1;
  };

  const updateBlockContent = (id: number, newcontent: string, isCaption: boolean) => {
    let newBlocks = [...blocks];
    const index = getBlockIndex(id);
    if (isCaption) {
      newBlocks[index].caption = newcontent;
    } else {
      newBlocks[index].content = newcontent;
    }
    setBlocks(newBlocks);
  };

  const updateImageFile = (id: number, newFile: File) => {
    let newBlocks = [...blocks];
    const index = getBlockIndex(id);
    newBlocks[index].file = newFile;
    setBlocks(newBlocks);
  };

  const addBlock = (blockType: string) => {
    let newBlocks = [...blocks];
    newBlocks.push({ id: currId, type: blockType, content: "" });
    setBlocks(newBlocks);
    setCurrId(currId + 1);
  };

  const addImage = () => {
    var reader = new FileReader();
    let newBlocks = [...blocks];
    reader.onload = () => {
      newBlocks.push({
        id: currId,
        type: "image",
        content: reader.result!.toString(), //read content goes here
        caption: "",
        isDeletable: true,
        file: uploadRef.current!.files![0],
      });
      setBlocks(newBlocks);
      setCurrId(currId + 1);
    };
    reader.readAsDataURL(uploadRef.current!.files![0]!);
  };

  const moveBlockDown = (id: number) => {
    const index = getBlockIndex(id);
    if (index < blocks.length - 1) {
      let newBlocks = [...blocks];
      let element = newBlocks[index];
      newBlocks.splice(index, 1);
      newBlocks.splice(index + 1, 0, element);
      setBlocks(newBlocks);
    }
  };

  const moveBlockUp = (id: number) => {
    const index = getBlockIndex(id);
    if (index > 1) {
      let newBlocks = [...blocks];
      let element = newBlocks[index];
      newBlocks.splice(index, 1);
      newBlocks.splice(index - 1, 0, element);
      setBlocks(newBlocks);
    }
  };

  const deleteBlock = (id: number) => {
    let choice = window.confirm("Are you sure you want to delete this component?");
    if (choice) {
      let newBlocks = [...blocks];
      setBlocks(
        newBlocks.filter((block) => {
          return block.id !== id;
        })
      );
    }
  };

  const handleTitleChange = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const text = target.value;
    if (text.length <= 100) {
      setTitle(text);
    }
  };

  const handleDescriptionChange = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const text = target.value;
    if (text.length <= 150) {
      setDescription(text);
    }
  };

  const submit = () => {
    if (devMode) {
      if (title.length === 0 || description.length === 0 || !blocks[0].file) {
        alert("Please provide a title, description and a main image for the article");
      }
      var formData = new FormData();
      for (let block of blocks) {
        //remove image source from image blocks
        if (block.type === "image") {
          let imgsrc = block.file;
          if (imgsrc) {
            formData.append("articleImages", imgsrc);
            block.content = ""; //no need to pass the string version of the image
          }
        }
      }
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("blocks", JSON.stringify(blocks));
      fetch((devMode ? "http://localhost:8000" : "") + "/articles/create", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      })
        .then((res) => {
          if (res.status === 401) {
            alert("Authorization Error");
            window.location.reload();
          } else if (res.status === 403) {
            alert("You are not authorized to perform this action.");
          } else {
            return res.json();
          }
        })
        .then((json) => {
          if (json) {
            alert("Article successfully created");
            props.history.push("/");
          }
        })
        .catch((error) => alert(error));
    } else {
      alert("Cannot perform this action in the demo version");
    }
  };

  return (
    <div id='createArticleContainer'>
      <div id='createArticleControls'>
        <button
          onClick={() => {
            addBlock("subheader");
          }}>
          Add Subheader
        </button>
        <button
          onClick={() => {
            addBlock("text");
          }}>
          Add Text
        </button>
        <div id='addImageContainer'>
          <input
            ref={uploadRef}
            onChange={addImage}
            type='file'
            id='addImageButtonInput'
          />
          <button
            onClick={() => {
              addBlock("image");
            }}>
            Add Image
          </button>
        </div>
        <button style={{ marginTop: "100px" }} onClick={submit}>
          Submit
        </button>
      </div>
      <div id='createArticlePreview'>
        <input
          placeholder='Enter Title Here ...(Max 100 characters)'
          id='createArticleTitle'
          value={title}
          onChange={(e) => handleTitleChange(e)}
        />
        <textarea
          id='createArticleDescription'
          placeholder='Write a short description for your article here...(Max 150 characters)'
          rows={4}
          value={description}
          onChange={(e) => handleDescriptionChange(e)}
        />
        <div id='articleInfoContainer'>
          <img
            alt='profilepicture'
            src={(devMode ? "http://localhost:8000/" : "/") + userImage}
          />
          <div style={{ paddingTop: 3 }}>
            <p> By: {username} </p>
            <p> Posted on {date} </p>
          </div>
        </div>
        {blocks.map((block) => {
          return convertToJsx(block);
        })}
      </div>
    </div>
  );
};

export default withRouter(CreateArticle);
