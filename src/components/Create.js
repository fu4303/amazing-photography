import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Col,
  Alert,
  Card,
  Media,
} from "react-bootstrap";
import { db } from "../firebase/index";
import { useMainContext } from "../context/MainContext";
import UploadImage from "./UploadImage";
import "../App.css";

const Create = () => {
  const [loaded, setLoaded] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const { allPicsInDb, user, resetPicsSelection } = useMainContext();
  const [file, setFile] = useState(false);
  const [code, setCode] = useState("");

  const setName = (e) => {
    setAlbumName(e.target.value);
  };

  const confirmFile = (message) => {
    if (message === true) {
      setFile(false);
    } else {
      setFile(true);
    }
  };

  const createAlbum = async (e) => {
    e.preventDefault();

    const selected = allPicsInDb.filter((pic) => pic.selected === true);

    if (!selected.length) {
      alert("You need to upload or select at least 1 pic");
      return;
    } else {
      const truthy = allPicsInDb.filter((pic) => pic.selected === true);
      const urls = truthy.map((pic) => pic.url);
      let ranNum;
      ranNum = Math.floor(Math.random() * 10000000);
      await db
        .collection("albums")
        .doc()
        .set({
          title: albumName.toLowerCase(),
          cust_approved: false,
          url: Math.floor(Math.random() * 200).toString(),
          photo_urls: [...urls],
          code: ranNum,
          user: user.email,
        })
        .then(function () {
          console.log("Document successfully written!");
          setLoaded(false);
          setCode(ranNum);
          resetPicsSelection();
        })
        .catch(function (error) {
          console.error("Error writing document: ", error);
        });
    }
  };

  useEffect(() => {
    if (allPicsInDb && allPicsInDb.length) {
      setLoaded(true);
    }
  }, [allPicsInDb]);

  return (
    <>
      {!code && loaded && allPicsInDb && (
        <Container>
          <Col lg={10} className="my-5 pt-5 mx-auto">
            <Form className="mx-auto form px-5 py-5" onSubmit={createAlbum}>
              <Form.Group>
                <Form.Label>
                  <h2>CREATE YOUR ALBUM</h2>
                </Form.Label>
                <Form.Control
                  className="my-3"
                  type="text"
                  placeholder="Set an album name"
                  onChange={setName}
                  required
                />
                <Col lg={12} md={10} className="d-flex flex-wrap">
                  {allPicsInDb &&
                    allPicsInDb.map((pic, index) => {
                      if (pic.selected === true && pic.user === user.email) {
                        return (
                          <Card className="ml-3" id="media" key={index}>
                            <Media key={pic.id} className="my-auto">
                              <img
                                width="100%"
                                height="auto"
                                src={pic.url}
                                alt="Generic placeholder"
                              />
                            </Media>
                          </Card>
                        );
                      }
                    })}
                </Col>
                <UploadImage albumName={albumName} setErrorMsg={confirmFile} />
                <Button className="mt-0" variant="primary" type="submit">
                  Confirm
                </Button>
              </Form.Group>
            </Form>
            {!file && (
              <Alert variant="warning">You haven??t uploaded any pics</Alert>
            )}
          </Col>
        </Container>
      )}
      {code && (
        <Alert variant="success">
          <h2>Album succesfully created!</h2>
          <div>
            The album code for your customer is (copy this link){" "}
            <p>
              <a href={`/review/${code}`}>
                <strong>photography.catala-sverdrup.se/review/{code}</strong>
              </a>
            </p>
            <Link to="/albums">
              <p>Go back to albums</p>
            </Link>
          </div>
        </Alert>
      )}
    </>
  );
};

export default Create;
