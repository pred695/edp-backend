import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Spinner,
  useToast,
  Box,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
} from '@chakra-ui/react';
import { getItemById } from '../utils/api';
import api from '../utils/api';

function ItemDetail({ isOpen, onClose, itemId, onItemUpdated }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [rfidInput, setRfidInput] = useState('');
  const [rfidError, setRfidError] = useState('');
  const cancelRef = React.useRef();
  const toast = useToast();

  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId) return;
      
      setLoading(true);
      try {
        const response = await getItemById(itemId);
        setItem(response.data);
      } catch (error) {
        console.error('Error fetching item details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch item details',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && itemId) {
      fetchItemDetails();
    }
  }, [isOpen, itemId, toast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleRfidChange = (e) => {
    setRfidInput(e.target.value);
    // Clear error when user types
    if (rfidError) {
      setRfidError('');
    }
  };

  const validateRfid = () => {
    // Check if RFID is empty
    if (!rfidInput.trim()) {
      setRfidError('RFID tag is required');
      return false;
    }

    // Check if RFID is a valid number
    if (isNaN(rfidInput) || parseInt(rfidInput) <= 0) {
      setRfidError('RFID tag must be a valid positive number');
      return false;
    }

    // If item has an RFID, check if it matches
    if (item.rfid && parseInt(rfidInput) !== item.rfid) {
      setRfidError(`RFID tag does not match item's registered tag (${item.rfid})`);
      return false;
    }

    return true;
  };

  const handleCheckoutItem = async () => {
    if (!item || item.timestamp_out) return;
    
    // Validate RFID input
    if (!validateRfid()) {
      return;
    }
    
    setIsCheckingOut(true);
    try {
      const response = await api.put(`/items/${item.id}/checkout`, {
        rfid: parseInt(rfidInput)
      });
      // Update the local state
      setItem(response.data.item);
      
      // Show success message
      toast({
        title: 'Item Checked Out',
        description: 'The item has been successfully checked out.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      // Notify parent component to refresh the items list
      if (onItemUpdated) {
        onItemUpdated();
      }
      
      // Reset form and close dialog
      setRfidInput('');
      setIsCheckoutDialogOpen(false);
    } catch (error) {
      console.error('Error checking out item:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to check out item',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCancelCheckout = () => {
    setRfidInput('');
    setRfidError('');
    setIsCheckoutDialogOpen(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="edpPrimary">Item Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="edpPrimary" />
            </Box>
          ) : !item ? (
            <Text color="red.500">Item not found</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">Item ID:</Text>
                <Text>{item.id}</Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Category:</Text>
                <Text>{item.category}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Status:</Text>
                <Badge colorScheme={item.timestamp_out ? "red" : "green"}>
                  {item.timestamp_out ? "Out of Stock" : "In Stock"}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Weight:</Text>
                <Text>{item.weight} kg</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Perishable:</Text>
                <Badge colorScheme={item.perishable ? "orange" : "green"}>
                  {item.perishable ? "Yes" : "No"}
                </Badge>
              </HStack>
              
              {item.perishable && (
                <HStack justify="space-between">
                  <Text fontWeight="bold">Expiry Date:</Text>
                  <Text>{formatDate(item.expiry_date)}</Text>
                </HStack>
              )}
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Dry:</Text>
                <Badge colorScheme={item.dry ? "blue" : "gray"}>
                  {item.dry ? "Yes" : "No"}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Fragile:</Text>
                <Badge colorScheme={item.fragile ? "red" : "gray"}>
                  {item.fragile ? "Yes" : "No"}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Threshold:</Text>
                <Text>{item.threshold}</Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">RFID Tag:</Text>
                <Text>{item.rfid}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Camera ID:</Text>
                <Text>{item.camera_id}</Text>
              </HStack>
              
              <Divider />
              
              <HStack justify="space-between">
                <Text fontWeight="bold">Time In:</Text>
                <Text>{formatDate(item.timestamp_in)}</Text>
              </HStack>
              
              {item.timestamp_out && (
                <HStack justify="space-between">
                  <Text fontWeight="bold">Time Out:</Text>
                  <Text>{formatDate(item.timestamp_out)}</Text>
                </HStack>
              )}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          {item && !item.timestamp_out && (
            <Button 
              colorScheme="red" 
              mr={3} 
              onClick={() => setIsCheckoutDialogOpen(true)}
            >
              Check Out Item
            </Button>
          )}
          <Button onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
      
      {/* RFID Checkout Dialog */}
      <AlertDialog
        isOpen={isCheckoutDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleCancelCheckout}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Check Out Item
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={4}>
                Please confirm the RFID tag for this item before checking it out.
              </Text>
              
              <FormControl isRequired isInvalid={!!rfidError}>
                <FormLabel>RFID Tag</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter RFID tag"
                  value={rfidInput}
                  onChange={handleRfidChange}
                  min="1"
                />
                {rfidError ? (
                  <FormHelperText color="red.500">{rfidError}</FormHelperText>
                ) : (
                  <FormHelperText>
                    {item?.rfid ? `Registered RFID: ${item.rfid}` : "Enter the RFID tag for this item"}
                  </FormHelperText>
                )}
              </FormControl>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleCancelCheckout}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleCheckoutItem} 
                ml={3}
                isLoading={isCheckingOut}
                isDisabled={!rfidInput}
              >
                Check Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Modal>
  );
}

export default ItemDetail;