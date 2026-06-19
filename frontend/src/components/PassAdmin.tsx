import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import type { RoomMember } from "../../../shared/types";
import { socket } from "@/client/client";

interface PassAdminProps {
  roomMembers: RoomMember[];
}

function PassAdmin({ roomMembers }: PassAdminProps) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="secondary" className="mx-1" onClick={handleShow}>
        Pass Admin
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Pass Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            id="passAdminForm"
            onSubmit={(e) => {
              e.preventDefault();
              const passAdminData = new FormData(e.currentTarget);
              const newAdmin = passAdminData.get("newAdmin") as string;

              const selectedMember = roomMembers.find(
                (member) => member.displayName === newAdmin,
              );

              if (selectedMember) {
                socket.emit("pass-admin", {
                  clientId: selectedMember.clientId,
                  displayName: selectedMember.displayName,
                  permission: selectedMember.permission,
                  roomCode: selectedMember.roomCode,
                });
              }
            }}
          >
            <Form.Group className="mb-3" controlId="selectNewAdmin">
              <Form.Label>Select New Admin</Form.Label>
              <Form.Select name="newAdmin">
                {roomMembers.map((member) => {
                  return <option>{member.displayName}</option>;
                })}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="passAdminForm"
            onClick={handleClose}
          >
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PassAdmin;
