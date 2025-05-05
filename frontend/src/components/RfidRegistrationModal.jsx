import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Spinner,
  Text,
  Center,
  FormHelperText,
} from '@chakra-ui/react';
import api from '../utils/api';

function RfidRegistrationModal({ isOpen, onClose }) {
  const [rfid, setRfid] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    setRfid(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate RFID as a positive integer
      if (!rfid || isNaN(rfid) || parseInt(rfid) <= 0) {
        throw new Error('Please enter a valid positive integer for RFID');
      }

      // Register the RFID tag
      await api.post('/rfid/register', { rfid: parseInt(rfid) });
      
      // Show success message
      setSuccess(true);
      toast({
        title: 'RFID Registered',
        description: 'RFID tag has been successfully registered',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      // Reset form
      setRfid('');
      
      // Close modal after a short delay to show success state
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error registering RFID tag:', error);
      
      // Extract error message
      let errorMessage = 'Failed to register RFID tag';
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Check for field-specific errors
        if (error.response.data.errors && error.response.data.errors.rfid) {
          errorMessage = error.response.data.errors.rfid;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error message
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="edpPrimary">Register RFID Tag</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {success ? (
            <Center py={10} flexDirection="column">
              <Text
                color="green.500"
                fontWeight="bold"
                fontSize="xl"
                mb={2}
              >
                Success!
              </Text>
              <Text>RFID tag registered successfully</Text>
            </Center>
          ) : (
            <form id="rfid-form" onSubmit={handleSubmit}>
              <FormControl isRequired>
                <FormLabel>RFID Tag Number</FormLabel>
                <Input
                  type="number"
                  name="rfid"
                  value={rfid}
                  onChange={handleChange}
                  placeholder="Enter RFID tag number"
                  min="1"
                />
                <FormHelperText>Enter a unique positive integer for the RFID tag</FormHelperText>
              </FormControl>
            </form>
          )}
        </ModalBody>

        <ModalFooter>
          {!success && (
            <>
              <Button 
                mr={3} 
                onClick={onClose}
                variant="outline"
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="purple"
                bg="edpSecondary"
                isLoading={loading}
                type="submit"
                form="rfid-form"
                _hover={{ bg: '#bf0055' }}
              >
                Register RFID
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RfidRegistrationModal;