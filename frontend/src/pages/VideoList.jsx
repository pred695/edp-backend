import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Spinner,
  useToast,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { 
  FiUpload, 
  FiEye, 
  FiMoreVertical, 
  FiTrash2, 
  FiClock,
  FiCheck,
  FiX,
  FiLoader
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/AuthStore';
import api from '../utils/api';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Add state for the video modal
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));

  const navigate = useNavigate();
  const toast = useToast();

  const fetchVideos = async (pageNum = page) => {
    setLoading(true);
    try {
      const response = await api.get('/videos', {
        params: {
          page: pageNum,
          limit
        }
      });
      
      setVideos(response.data.videos);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch videos');
      toast({
        title: 'Error',
        description: 'Failed to fetch videos',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

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
    
    fetchVideos();
  }, [isAuth, navigate, toast, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleDeleteVideo = async (id) => {
    try {
      await api.delete(`/videos/${id}`);
      
      toast({
        title: 'Video deleted',
        description: 'The video has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      // Refresh the video list
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // Handle opening the video player modal
  const handleViewVideo = (video) => {
    setSelectedVideo(video);
    onOpen();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge colorScheme="gray" display="flex" alignItems="center">
            <FiClock style={{ marginRight: '4px' }} /> Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge colorScheme="blue" display="flex" alignItems="center">
            <FiLoader style={{ marginRight: '4px' }} /> Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge colorScheme="green" display="flex" alignItems="center">
            <FiCheck style={{ marginRight: '4px' }} /> Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge colorScheme="red" display="flex" alignItems="center">
            <FiX style={{ marginRight: '4px' }} /> Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <>
      <Helmet>
        <title>EDP - Video Footage</title>
        <meta name="description" content="Manage video footage and analysis" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="edpPrimary">
            Video Footage
          </Heading>
          <Button
            leftIcon={<FiUpload />}
            colorScheme="purple"
            bg="edpSecondary"
            color="white"
            onClick={() => navigate('/videos/upload')}
            _hover={{ bg: '#bf0055' }}
          >
            Upload New Video
          </Button>
        </Flex>

        {loading ? (
          <Center p={10}>
            <Spinner size="xl" color="edpPrimary" />
          </Center>
        ) : error ? (
          <Center p={10}>
            <Text color="red.500">{error}</Text>
          </Center>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple" bg="white" borderRadius="md" boxShadow="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>ID</Th>
                    <Th>Filename</Th>
                    <Th>Camera</Th>
                    <Th>Size</Th>
                    <Th>Upload Date</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {videos.length === 0 ? (
                    <Tr>
                      <Td colSpan={7} textAlign="center" py={10}>
                        <Text fontSize="lg" color="gray.500">No videos found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    videos.map((video) => (
                      <Tr key={video.id}>
                        <Td>{video.id}</Td>
                        <Td>
                          <Text noOfLines={1} maxW="200px">
                            {video.original_filename}
                          </Text>
                        </Td>
                        <Td>
                          <Tag colorScheme="purple">
                            Camera {video.camera_id}
                          </Tag>
                        </Td>
                        <Td>{formatFileSize(video.size_bytes)}</Td>
                        <Td>{formatDate(video.upload_date)}</Td>
                        <Td>{getStatusBadge(video.status)}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<FiEye />}
                              aria-label="View video"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleViewVideo(video)}
                            />
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FiMoreVertical />}
                                variant="ghost"
                                aria-label="More options"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<FiTrash2 />} 
                                  color="red.500"
                                  onClick={() => handleDeleteVideo(video.id)}
                                >
                                  Delete
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            <Flex justify="center" mt={6}>
              <HStack spacing={2}>
                <Button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  size="sm"
                >
                  Previous
                </Button>
                <Text>
                  Page {page} of {totalPages}
                </Text>
                <Button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  size="sm"
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          </>
        )}
      </Box>

      {/* Video Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedVideo?.original_filename || "Video Player"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedVideo && (
              <Box borderRadius="md" overflow="hidden">
                <video 
                  controls 
                  width="100%" 
                  autoPlay
                  src={`${api.defaults.baseURL}/videos/${selectedVideo.id}/stream`}
                >
                  Your browser does not support the video tag.
                </video>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/videos/${selectedVideo?.id}`)}
            >
              View Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default VideoList;