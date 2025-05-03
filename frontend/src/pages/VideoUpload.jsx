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
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { FiUpload, FiVideo, FiPlay } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/AuthStore';
import api from '../utils/api';

function VideoUpload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [loading, setLoading] = useState(true);

  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isAuth) {
      toast({
        title: 'Authentication required',
        description: 'Please login to access this page',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login');
      return;
    }

    // Fetch cameras
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
  }, [isAuth, navigate, toast]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Create a preview URL for the video
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      
      // Clean up previous preview URL when component unmounts
      return () => URL.revokeObjectURL(previewUrl);
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
      const response = await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
      
      toast({
        title: 'Upload successful',
        description: 'Your video has been uploaded and will be processed',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      
      // Navigate to videos list or details page
      navigate('/videos');
    } catch (error) {
      console.error('Error uploading video:', error);
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
    <>
      <Helmet>
        <title>EDP - Upload Video</title>
        <meta name="description" content="Upload video footage for analysis" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6} color="edpPrimary">
          Upload Video Footage
        </Heading>
        
        <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
          {/* Left side - Upload form */}
          <Box flex="1">
            <VStack 
              spacing={6} 
              align="stretch" 
              p={6} 
              bg="white" 
              borderRadius="md" 
              boxShadow="sm"
            >
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
                  id="video-upload"
                  isDisabled={uploading}
                />
                <Button
                  as="label"
                  htmlFor="video-upload"
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
              
              <Button
                colorScheme="purple"
                bg="edpSecondary"
                size="lg"
                isLoading={uploading}
                loadingText="Uploading..."
                isDisabled={!file || !selectedCamera}
                onClick={handleUpload}
                leftIcon={<FiUpload />}
                _hover={{ bg: '#bf0055' }}
              >
                Upload Video
              </Button>
            </VStack>
          </Box>
          
          {/* Right side - Preview */}
          <Box flex="1">
            <VStack 
              spacing={4} 
              align="stretch" 
              p={6} 
              bg="white" 
              borderRadius="md" 
              boxShadow="sm" 
              h="full"
            >
              <Heading size="md" color="edpPrimary">Video Preview</Heading>
              
              {preview ? (
                <Box borderRadius="md" overflow="hidden" position="relative">
                  <video 
                    src={preview} 
                    controls 
                    style={{ width: '100%', borderRadius: '0.375rem' }} 
                  />
                </Box>
              ) : (
                <Center 
                  h="300px" 
                  bg="gray.100" 
                  borderRadius="md" 
                  flexDirection="column" 
                  gap={4}
                >
                  <Icon as={FiPlay} boxSize={12} color="gray.400" />
                  <Text color="gray.500">Video preview will appear here</Text>
                </Center>
              )}
              
              <Text fontSize="sm" color="gray.600" mt={4}>
                After uploading, the video will be processed by our computer vision models to detect objects and events.
              </Text>
            </VStack>
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default VideoUpload;