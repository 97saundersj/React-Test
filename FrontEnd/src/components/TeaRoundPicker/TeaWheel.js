import React, { useState } from 'react';
import axios from 'axios';
import { Wheel } from 'react-custom-roulette';
import { Modal, Button, Alert } from 'react-bootstrap';
import oilcanSvg from '../../images/oil-can.svg';

const TeaWheel = ({ participants = [], teamId, showModal, onClose, pickedTeaMaker }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [modalVisible, setModalVisible] = useState(showModal);
  const [prizeNumber, setPrizeNumber] = useState(0);
  
  // Create wheel data from participants
  const wheelData = participants.length > 0 
    ? participants.map(p => ({ option: p.name }))
    : [{ option: 'No participants' }];

  // Pick random tea maker
  const pickTeaMaker = async () => {
    if (!teamId || participants.length === 0) return;
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_WEB_API_URL}/participant/${teamId}/random`);
      const participantName = response.data;
      setSelectedParticipant(participantName);
      
      const index = participants.findIndex(p => p.name === participantName);
      setPrizeNumber(index !== -1 ? index : 0);
      setModalVisible(true);
      
      // Small delay to ensure state is updated
      setTimeout(() => setIsSpinning(true), 50);
    } catch (error) {
      console.error("Error picking tea maker:", error);
    }
  };

  // Wheel callbacks
  const handleSpinEnd = () => {
    setIsSpinning(false);
    if (typeof pickedTeaMaker === 'function') pickedTeaMaker();
  };

  const handleClose = () => {
    setIsSpinning(false);
    setModalVisible(false);
    if (typeof onClose === 'function') onClose();
  };

  if (!teamId) return null;

  return (
    <div className="card m-2">
      <div className="card-body">
        <h5 className="card-title">Pick Tea Maker</h5>
        <button
          className="btn btn-success btn-lg w-100 mb-3"
          onClick={pickTeaMaker}
          disabled={isSpinning || participants.length === 0}
        >
          Pick Tea Maker
        </button>
      </div>
    
      <Modal show={modalVisible} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tea Wheel</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', position: 'relative' }}>
            <Wheel
              mustStartSpinning={isSpinning}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleSpinEnd}
              spinDuration={0.3}
              backgroundColors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']}
              textColors={['#FFFFFF']}
              outerBorderColor="#EEEEEE"
              outerBorderWidth={3}
              innerRadius={0}
              innerBorderColor="#FFFFFF"
              innerBorderWidth={2}
              radiusLineColor="#FFFFFF"
              radiusLineWidth={2}
              perpendicularText={true}
              textDistance={85}
              pointerProps={{
                src: oilcanSvg,
                style: {
                  transform: 'scaleX(-1) rotate(45deg)',
                  filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            />
          </div>

          {selectedParticipant && !isSpinning && (
            <Alert variant="success" className="text-center mt-3">
              🎉 {selectedParticipant} will make the tea! 🎉
            </Alert>
          )}

          <Modal.Footer>
            {selectedParticipant && !isSpinning && (
              <Button 
                variant="primary" 
                onClick={pickTeaMaker}
              >
                Spin Again?
              </Button>
            )}
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeaWheel;
