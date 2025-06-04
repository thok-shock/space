import { Modal, Button, ListGroup } from 'react-bootstrap';

export default function PowerupModal({ show, onClose, currency, powerups, purchased, onBuy }) {

    const sortedPowerups = powerups.sort((a,b) => a.cost - b.cost)
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Powerups</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Currency:</strong> {currency}</p>
        <ListGroup>
          {powerups.map(p => (
            <ListGroup.Item key={p.id} className="d-flex justify-content-between align-items-center">
              <div>
                <strong style={{textTransform: 'uppercase'}}>{p.name}</strong><br />
                {!purchased[p.id] && <p style={{fontSize: '0.8em'}}>{p.description}</p>}
              </div>
              {purchased[p.id] ? (
                <span className="badge bg-success">Purchased</span>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={currency < p.cost}
                  onClick={() => onBuy(p)}
                >
                  ${p.cost}
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

