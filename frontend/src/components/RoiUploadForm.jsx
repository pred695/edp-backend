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
  Select,
  Spinner,
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
import { FiUpload, FiVideo, FiPlay } from 'react-icons/fi';
import api from '../utils/api';
import { uploadRoiVideo } from '../utils/api';

function RoiUploadForm({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    // Fetch cameras when the modal opens
    if (isOpen) {
      const fetchCameras = async () => {
        try {
          // This is a mock endpoint - you would need to create this endpoint
          const response = await api.get('/cameras');
          setCameras(response.data);
        } catch (error) {
          console.error('Error fetching cameras:', error);
          // Fallback to some default values for demo
          setCameras([
            { camera_id: 101, location: 'Main Entrance' },
            { camera_id: 102, location: 'Warehouse Floor' },
            { camera_id: 103, location: 'Loading Bay' },
            { camera_id: 104, location: 'Storage Area' },
            { camera_id: 105, location: 'Packaging Zone' }
          ]);
        } finally {
          setLoading(false);
        }
      };

      fetchCameras();
      
      // Reset form state
      setFile(null);
      setFileName('No file selected');
      setPreview(null);
      setUploadProgress(0);
      setSelectedCamera('');
    }
  }, [isOpen]);

  // Clean up preview URL when component unmounts or modal closes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Create a preview URL for the video
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file to upload',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (!selectedCamera) {
      toast({
        title: 'No camera selected',
        description: 'Please select a camera for this video',
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
      formData.append('video', file);
      formData.append('camera_id', selectedCamera);
      
      // Upload with progress tracking
      await uploadRoiVideo(formData, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
      });
      
      toast({
        title: 'Upload successful',
        description: 'Your ROI video has been uploaded successfully',
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
      console.error('Error uploading ROI video:', error);
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
        <ModalHeader color="edpPrimary">Upload ROI Video</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={6}>
            {/* Left side - Upload form */}
            <Box flex="1">
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Select Camera</FormLabel>
                  <Select 
                    placeholder="Select camera" 
                    value={selectedCamera}
                    onChange={handleCameraChange}
                    isDisabled={loading || uploading}
                  >
                    {cameras.map(camera => (
                      <option key={camera.camera_id} value={camera.camera_id}>
                        Camera {camera.camera_id} - {camera.location || 'Unknown'}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Video File</FormLabel>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    display="none"
                    id="roi-video-upload"
                    isDisabled={uploading}
                  />
                  <Button
                    as="label"
                    htmlFor="roi-video-upload"
                    leftIcon={<FiUpload />}
                    colorScheme="blue"
                    variant="outline"
                    width="full"
                    cursor="pointer"
                    isDisabled={uploading}
                  >
                    Select Video File
                  </Button>
                  <Text mt={2} fontSize="sm" color="gray.600">
                    {fileName}
                  </Text>
                </FormControl>
                
                {file && (
                  <FormControl>
                    <FormLabel>Selected File Details</FormLabel>
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <HStack spacing={4}>
                        <Icon as={FiVideo} boxSize={5} color="edpSecondary" />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{file.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
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
                <Heading size="sm" color="edpPrimary">Video Preview</Heading>
                
                {preview ? (
                  <Box borderRadius="md" overflow="hidden">
                    <video 
                      src={preview} 
                      controls 
                      style={{ width: '100%', borderRadius: '0.375rem' }} 
                    />
                  </Box>
                ) : (
                  <Center 
                    h="180px" 
                    bg="gray.100" 
                    borderRadius="md" 
                    flexDirection="column" 
                    gap={4}
                  >
                    <Icon as={FiPlay} boxSize={8} color="gray.400" />
                    <Text color="gray.500">Video preview will appear here</Text>
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
            isDisabled={!file || !selectedCamera}
            _hover={{ bg: '#bf0055' }}
          >
            Upload Video
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RoiUploadForm;