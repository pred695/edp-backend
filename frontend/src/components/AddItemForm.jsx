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
  Select,
  Switch,
  FormHelperText,
  useToast,
  VStack,
  Divider,
  Text
} from '@chakra-ui/react';
import api from '../utils/api';

function AddItemForm({ isOpen, onClose, onItemAdded }) {
  const [formData, setFormData] = useState({
    category: '',
    perishable: false,
    weight: '',
    dry: true,
    fragile: false,
    threshold: '',
    expiry_date: '',
    camera_id: '',
    rfid: ''
  });
  
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePerishableChange = (e) => {
    const isPerishable = e.target.checked;
    setFormData({
      ...formData,
      perishable: isPerishable,
      // Clear expiry date if not perishable
      expiry_date: isPerishable ? formData.expiry_date : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert string values to appropriate types
      const processedData = {
        ...formData,
        weight: Number(formData.weight),
        threshold: Number(formData.threshold),
        camera_id: Number(formData.camera_id),
        rfid: Number(formData.rfid)
      };

      // Submit the form data
      await api.post('/items', processedData);
      
      // Show success message
      toast({
        title: 'Item registered',
        description: 'Item has been successfully registered',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
      
      // Reset form
      setFormData({
        category: '',
        perishable: false,
        weight: '',
        dry: true,
        fragile: false,
        threshold: '',
        expiry_date: '',
        camera_id: '',
        rfid: ''
      });
      
      // Close modal and refresh parent component
      if (onItemAdded) onItemAdded();
      else onClose();
      
    } catch (error) {
      console.error('Error registering item:', error);
      
      // Extract error message
      let errorMessage = 'Failed to register item';
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Check for field-specific errors
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          const errorFields = Object.keys(errors).filter(key => errors[key]);
          
          if (errorFields.length > 0) {
            errorMessage = errorFields.map(field => errors[field]).join(', ');
          }
        }
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="edpPrimary">Register New Item</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="add-item-form" onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Item category"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="perishable" mb="0">
                  Perishable Item
                </FormLabel>
                <Switch
                  id="perishable"
                  name="perishable"
                  isChecked={formData.perishable}
                  onChange={handlePerishableChange}
                  colorScheme="orange"
                />
              </FormControl>

              {formData.perishable && (
                <FormControl isRequired={formData.perishable}>
                  <FormLabel>Expiry Date</FormLabel>
                  <Input
                    type="date"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                  />
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Weight (kg)</FormLabel>
                <Input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Item weight"
                  min="0.1"
                  step="0.1"
                />
                <FormHelperText>Weight in kilograms</FormHelperText>
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="dry" mb="0">
                  Dry
                </FormLabel>
                <Switch
                  id="dry"
                  name="dry"
                  isChecked={formData.dry}
                  onChange={handleChange}
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="fragile" mb="0">
                  Fragile
                </FormLabel>
                <Switch
                  id="fragile"
                  name="fragile"
                  isChecked={formData.fragile}
                  onChange={handleChange}
                  colorScheme="red"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Threshold</FormLabel>
                <Input
                  type="number"
                  name="threshold"
                  value={formData.threshold}
                  onChange={handleChange}
                  placeholder="Inventory threshold"
                  min="1"
                />
                <FormHelperText>Minimum quantity before reordering</FormHelperText>
              </FormControl>

              <Divider />
              
              <Text fontWeight="medium" color="edpPrimary">System Information</Text>

              <FormControl isRequired>
                <FormLabel>Camera ID</FormLabel>
                <Input
                  type="number"
                  name="camera_id"
                  value={formData.camera_id}
                  onChange={handleChange}
                  placeholder="Camera ID"
                  min="101"
                />
                <FormHelperText>Camera monitoring this item (IDs start at 101)</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>RFID Tag</FormLabel>
                <Input
                  type="number"
                  name="rfid"
                  value={formData.rfid}
                  onChange={handleChange}
                  placeholder="RFID Tag number"
                  min="1001"
                />
                <FormHelperText>Unique RFID tag for this item (IDs start at 1001)</FormHelperText>
              </FormControl>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button 
            mr={3} 
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            colorScheme="purple"
            bg="edpSecondary"
            isLoading={loading}
            type="submit"
            form="add-item-form"
            _hover={{ bg: '#bf0055' }}
          >
            Register Item
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default AddItemForm;