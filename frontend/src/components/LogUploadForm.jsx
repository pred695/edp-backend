import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Progress,
  Text,
  useToast,
  VStack,
  HStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiFileText } from 'react-icons/fi';
import { uploadLog } from '../utils/api';

function LogUploadForm({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [fileContent, setFileContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const toast = useToast();

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileName('No file selected');
      setFileContent('');
      setUploadProgress(0);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Read file preview if it's a text file
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Get the first 2000 characters as a preview
          const content = event.target.result.substring(0, 2000);
          setFileContent(content);
        } catch (err) {
          console.error('Error reading file:', err);
          setFileContent('Preview not available');
        }
      };
      
      // Read file as text if it's a text file
      if (selectedFile.type.includes('text') || 
          selectedFile.name.endsWith('.log') || 
          selectedFile.name.endsWith('.csv') || 
          selectedFile.name.endsWith('.json')) {
        reader.readAsText(selectedFile);
      } else {
        setFileContent('Binary file - preview not available');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a log file to upload',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data for the upload
      const formData = new FormData();
      formData.append('log', file);
      
      // Upload with progress tracking
      await uploadLog(formData, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
      });
      
      toast({
        title: 'Upload successful',
        description: 'Your log file has been uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      
      // Notify parent component about successful upload
      if (onUploaded) {
        onUploaded();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error uploading log file:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'An error occurred during upload',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="edpPrimary">Upload Log File</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            {/* Left side - Upload form */}
            <Box flex="1">
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Log File</FormLabel>
                  <Input
                    type="file"
                    accept=".txt,.log,.csv,.json,.xml"
                    onChange={handleFileChange}
                    display="none"
                    id="log-file-upload"
                    isDisabled={uploading}
                  />
                  <Button
                    as="label"
                    htmlFor="log-file-upload"
                    leftIcon={<FiUpload />}
                    colorScheme="blue"
                    variant="outline"
                    width="full"
                    cursor="pointer"
                    isDisabled={uploading}
                  >
                    Select Log File
                  </Button>
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {fileName}
                  </Text>
                  <Text mt={1} fontSize="xs" color="gray.500">
                    Supported formats: .txt, .log, .csv, .json, .xml
                  </Text>
                </FormControl>
                
                {file && (
                  <FormControl>
                    <FormLabel>Selected File Details</FormLabel>
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <HStack spacing={4}>
                        <Icon as={FiFile} boxSize={5} color="edpSecondary" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{file.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {(file.size / 1024).toFixed(2)} KB
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </FormControl>
                )}
                
                {uploading && (
                  <FormControl>
                    <FormLabel>Upload Progress</FormLabel>
                    <Progress
                      value={uploadProgress}
                      colorScheme="green"
                      size="sm"
                      borderRadius="md"
                      hasStripe
                      isAnimated
                    />
                    <Text mt={2} fontSize="sm" textAlign="center">
                      {uploadProgress}%
                    </Text>
                  </FormControl>
                )}
              </VStack>
            </Box>
            
            {/* Right side - Preview */}
            <Box flex="1">
              <VStack spacing={4} align="stretch">
                <Heading size="sm" color="edpPrimary">File Preview</Heading>
                
                {file ? (
                  <Box 
                    p={3} 
                    bg="gray.50" 
                    borderRadius="md" 
                    maxH="200px" 
                    overflow="auto"
                    fontFamily="monospace"
                    fontSize="xs"
                    whiteSpace="pre-wrap"
                  >
                    {fileContent || 'Preview not available'}
                  </Box>
                ) : (
                  <Center 
                    h="180px" 
                    bg="gray.100" 
                    borderRadius="md" 
                    flexDirection="column" 
                    gap={4}
                  >
                    <Icon as={FiFileText} boxSize={8} color="gray.400" />
                    <Text color="gray.500">File preview will appear here</Text>
                  </Center>
                )}
              </VStack>
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button 
            variant="outline" 
            mr={3} 
            onClick={onClose}
            isDisabled={uploading}
          >
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            bg="edpSecondary"
            leftIcon={<FiUpload />}
            onClick={handleUpload}
            isLoading={uploading}
            loadingText="Uploading..."
            isDisabled={!file}
            _hover={{ bg: '#bf0055' }}
          >
            Upload Log
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default LogUploadForm;