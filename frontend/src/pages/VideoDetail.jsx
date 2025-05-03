import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/AuthStore';
import api from '../utils/api';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiBox, FiCamera, FiCheck, FiClock, FiLoader, FiX } from 'react-icons/fi';
import { useToast } from '@chakra-ui/react';

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    
    const fetchVideoDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/videos/${id}`);
        setVideo(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch video details');
        toast({
          title: 'Error',
          description: 'Failed to fetch video details',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoDetails();
  }, [id, isAuth, navigate, toast]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return FiClock;
      case 'processing':
        return FiLoader;
      case 'completed':
        return FiCheck;
      case 'failed':
        return FiX;
      default:
        return FiAlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'gray';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <Helmet>
        <title>EDP - Video Details</title>
        <meta name="description" content="Video footage details and analysis results" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mb={4}
          onClick={() => navigate('/videos')}
        >
          Back to Videos
        </Button>

        {loading ? (
          <Center p={10}>
            <Spinner size="xl" color="edpPrimary" />
          </Center>
        ) : error ? (
          <Center p={10}>
            <Text color="red.500">{error}</Text>
          </Center>
        ) : !video ? (
          <Center p={10}>
            <Text color="red.500">Video not found</Text>
          </Center>
        ) : (
          <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
            {/* Left Column - Video and Details */}
            <Box flex="3">
              <VStack align="stretch" spacing={6}>
                <Box 
                  bg="white" 
                  p={6} 
                  borderRadius="md" 
                  boxShadow="sm"
                >
                  <Heading size="md" mb={4} color="edpPrimary">
                    Video Preview
                  </Heading>
                  <Box borderRadius="md" overflow="hidden" mb={4}>
                    <video 
                      src={`/api/videos/${video.id}/stream`} 
                      controls 
                      style={{ width: '100%', borderRadius: '0.375rem' }} 
                    />
                  </Box>
                  <HStack spacing={4} wrap="wrap">
                    <Tag size="lg" colorScheme={getStatusColor(video.status)}>
                      <Icon as={getStatusIcon(video.status)} mr={2} />
                      Status: {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </Tag>
                    <Tag size="lg" colorScheme="purple">
                      <Icon as={FiCamera} mr={2} />
                      Camera {video.camera_id}
                    </Tag>
                  </HStack>
                </Box>
                
                <Box 
                  bg="white" 
                  p={6} 
                  borderRadius="md" 
                  boxShadow="sm"
                >
                  <Heading size="md" mb={4} color="edpPrimary">
                    Video Details
                  </Heading>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Text fontWeight="bold" width="150px">Filename:</Text>
                      <Text>{video.original_filename}</Text>
                    </HStack>
                    <Divider />
                    <HStack>
                      <Text fontWeight="bold" width="150px">File Size:</Text>
                      <Text>{formatFileSize(video.size_bytes)}</Text>
                    </HStack>
                    <Divider />
                    <HStack>
                      <Text fontWeight="bold" width="150px">Format:</Text>
                      <Text>{video.format || 'Unknown'}</Text>
                    </HStack>
                    <Divider />
                    <HStack>
                      <Text fontWeight="bold" width="150px">Upload Date:</Text>
                      <Text>{formatDate(video.upload_date)}</Text>
                    </HStack>
                    {video.processed_date && (
                      <>
                        <Divider />
                        <HStack>
                          <Text fontWeight="bold" width="150px">Processed Date:</Text>
                          <Text>{formatDate(video.processed_date)}</Text>
                        </HStack>
                      </>
                    )}
                    <Divider />
                    <HStack>
                      <Text fontWeight="bold" width="150px">Camera ID:</Text>
                      <Tag colorScheme="purple">Camera {video.camera_id}</Tag>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </Box>
            
            {/* Right Column - Analysis Results */}
            <Box flex="2">
              <VStack align="stretch" spacing={6}>
                <Box 
                  bg="white" 
                  p={6} 
                  borderRadius="md" 
                  boxShadow="sm"
                >
                  <Heading size="md" mb={4} color="edpPrimary">
                    Analysis Results
                  </Heading>

                  {video.status === 'completed' && video.results ? (
                    <VStack align="stretch" spacing={4}>
                      {/* Display analysis results here */}
                      {/* This is just an example, adapt to your actual data structure */}
                      {video.results.items_detected && (
                        <Box>
                          <Heading size="sm" mb={2}>Items Detected</Heading>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Item Type</Th>
                                <Th isNumeric>Count</Th>
                                <Th>Confidence</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {Object.entries(video.results.items_detected).map(([key, value]) => (
                                <Tr key={key}>
                                  <Td>{key}</Td>
                                  <Td isNumeric>{value.count}</Td>
                                  <Td>
                                    <Badge colorScheme={
                                      value.confidence > 0.8 ? "green" : 
                                      value.confidence > 0.5 ? "yellow" : "red"
                                    }>
                                      {Math.round(value.confidence * 100)}%
                                    </Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      )}

                      {video.results.events && (
                        <Box mt={4}>
                          <Heading size="sm" mb={2}>Events Detected</Heading>
                          <Table size="sm" variant="simple">
                            <Thead>
                              <Tr>
                                <Th>Event</Th>
                                <Th>Timestamp</Th>
                                <Th>Confidence</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {video.results.events.map((event, idx) => (
                                <Tr key={idx}>
                                  <Td>{event.type}</Td>
                                  <Td>{event.timestamp}s</Td>
                                  <Td>
                                    <Badge colorScheme={
                                      event.confidence > 0.8 ? "green" : 
                                      event.confidence > 0.5 ? "yellow" : "red"
                                    }>
                                      {Math.round(event.confidence * 100)}%
                                    </Badge>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                    </VStack>
                  ) : video.status === 'processing' ? (
                    <Center p={8} flexDirection="column">
                      <Spinner size="xl" color="blue.500" mb={4} />
                      <Text>The video is currently being processed...</Text>
                    </Center>
                  ) : video.status === 'pending' ? (
                    <Center p={8} flexDirection="column">
                      <Icon as={FiClock} boxSize={12} color="gray.400" mb={4} />
                      <Text>The video is in the processing queue...</Text>
                    </Center>
                  ) : video.status === 'failed' ? (
                    <Center p={8} flexDirection="column" bg="red.50" borderRadius="md">
                      <Icon as={FiX} boxSize={12} color="red.500" mb={4} />
                      <Text color="red.500">Processing failed. Please try uploading again.</Text>
                    </Center>
                  ) : (
                    <Center p={8}>
                      <Text>No analysis results available</Text>
                    </Center>
                  )}
                </Box>
                
                {video.status === 'completed' && video.results && (
                  <Box 
                    bg="white" 
                    p={6} 
                    borderRadius="md" 
                    boxShadow="sm"
                  >
                    <Heading size="md" mb={4} color="edpPrimary">
                      Detected Objects
                    </Heading>
                    <Flex wrap="wrap" gap={3}>
                      {video.results.items_detected && Object.keys(video.results.items_detected).map(key => (
                        <Tag 
                          key={key} 
                          size="lg" 
                          borderRadius="full" 
                          variant="subtle"
                          colorScheme="blue"
                          p={2}
                        >
                          <Icon as={FiBox} mr={2} />
                          {key}
                        </Tag>
                      ))}
                    </Flex>
                  </Box>
                )}
              </VStack>
            </Box>
          </Flex>
        )}
      </Box>
    </>
  );
}

export default VideoDetail;