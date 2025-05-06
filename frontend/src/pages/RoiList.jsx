import React, { useEffect, useState, useRef } from 'react';
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
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Divider,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { 
  FiUpload, 
  FiEye, 
  FiMoreVertical, 
  FiTrash2, 
  FiFile,
  FiCheck,
  FiX,
  FiLoader,
  FiMaximize,
  FiDownload,
  FiMonitor,
  FiShield,
  FiMapPin,
  FiExternalLink
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/AuthStore';
import { 
  getRoiVideos,
  deleteRoiVideo,
  getRoiVideoStreamUrl,
  getLogs,
  deleteLog,
  getLogContentUrl
} from '../utils/api';
import RoiUploadForm from '../components/RoiUploadForm';
import LogUploadForm from '../components/LogUploadForm';

function RoiList() {
  // State for ROI videos
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [videoPage, setVideoPage] = useState(1);
  const [videoLimit] = useState(10);
  const [videoTotalPages, setVideoTotalPages] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [streamUrl, setStreamUrl] = useState('');
  
  // State for logs
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logError, setLogError] = useState(null);
  const [logPage, setLogPage] = useState(1);
  const [logLimit] = useState(10);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [logContent, setLogContent] = useState('');
  
  // Refs
  const videoRef = useRef(null);
  
  // Modal disclosures
  const { 
    isOpen: isVideoModalOpen, 
    onOpen: onVideoModalOpen, 
    onClose: onVideoModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isLogModalOpen, 
    onOpen: onLogModalOpen, 
    onClose: onLogModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isVideoUploadOpen, 
    onOpen: onVideoUploadOpen, 
    onClose: onVideoUploadClose 
  } = useDisclosure();
  
  const { 
    isOpen: isLogUploadOpen, 
    onOpen: onLogUploadOpen, 
    onClose: onLogUploadClose 
  } = useDisclosure();

  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));

  const navigate = useNavigate();
  const toast = useToast();

  // External model monitoring links
  // These URLs will be replaced later with actual Google Colab links
  const fireModelUrl = "https://colab.research.google.com/drive/13yFBIVv-79S8ofLE70o2eMOieV5hlD-F?usp=sharing"; 
  const ppeComplianceModelUrl = "https://colab.research.google.com/drive/1m4jVSp35N41peXo1EvwnawazrIzfnJa6?usp=sharing";
  const roiModelUrl = "https://colab.research.google.com/drive/1IcIOr4TAcsrBRSgQTRG3f6P8t9MtGAoi?usp=sharing";

  // Redirect to external model monitoring pages
  const openExternalModel = (url) => {
    window.open(url, '_blank');
  };

  // Fetch ROI videos
  const fetchVideos = async (pageNum = videoPage) => {
    setLoadingVideos(true);
    try {
      const response = await getRoiVideos({
        page: pageNum,
        limit: videoLimit
      });
      
      setVideos(response.data.videos);
      setVideoTotalPages(response.data.pagination.totalPages);
      setVideoError(null);
    } catch (err) {
      setVideoError('Failed to fetch ROI videos');
      toast({
        title: 'Error',
        description: 'Failed to fetch ROI videos',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoadingVideos(false);
    }
  };

  // Fetch logs
  const fetchLogs = async (pageNum = logPage) => {
    setLoadingLogs(true);
    try {
      const response = await getLogs({
        page: pageNum,
        limit: logLimit
      });
      
      setLogs(response.data.logs);
      setLogTotalPages(response.data.pagination.totalPages);
      setLogError(null);
    } catch (err) {
      setLogError('Failed to fetch logs');
      toast({
        title: 'Error',
        description: 'Failed to fetch logs',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoadingLogs(false);
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
    fetchLogs();
  }, [isAuth, navigate, toast]);

  // Pagination handlers
  const handleVideoPageChange = (newPage) => {
    setVideoPage(newPage);
    fetchVideos(newPage);
  };

  const handleLogPageChange = (newPage) => {
    setLogPage(newPage);
    fetchLogs(newPage);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  // Delete handlers
  const handleDeleteVideo = async (id) => {
    try {
      await deleteRoiVideo(id);
      
      toast({
        title: 'Video deleted',
        description: 'The ROI video has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      fetchVideos();
    } catch (error) {
      console.error('Error deleting ROI video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ROI video',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await deleteLog(id);
      
      toast({
        title: 'Log deleted',
        description: 'The log file has been successfully deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      
      fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete log file',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  // Video view handler
  const handleViewVideo = (video) => {
    setSelectedVideo(video);
    const url = getRoiVideoStreamUrl(video.id);
    setStreamUrl(url);
    onVideoModalOpen();
  };

  // Log view handler
  const handleViewLog = (log) => {
    setSelectedLog(log);
    
    // Fetch the log content
    fetch(getLogContentUrl(log.file_id))
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch log content');
        }
        return response.text();
      })
      .then(content => {
        setLogContent(content);
        onLogModalOpen();
      })
      .catch(error => {
        console.error('Error fetching log content:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch log content',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      });
  };

  // Fullscreen handler for video
  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) { /* Safari */
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) { /* IE11 */
        videoRef.current.msRequestFullscreen();
      }
    }
  };

  // Download log handler
  const handleDownloadLog = (log) => {
    window.open(getLogContentUrl(log.file_id, true), '_blank');
  };

  // File upload success handlers
  const handleVideoUploaded = () => {
    fetchVideos();
    onVideoUploadClose();
  };

  const handleLogUploaded = () => {
    fetchLogs();
    onLogUploadClose();
  };

  return (
    <>
      <Helmet>
        <title>EDP - Region of Interest</title>
        <meta name="description" content="Manage ROI videos and logs" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6} color="edpPrimary">
          Region of Interest (ROI)/Smoke/PPE Compliance
        </Heading>

        {/* Model Monitoring Section */}
        <Box mb={8} p={4} bg="white" borderRadius="md" boxShadow="sm">
          <Heading size="md" mb={4} color="edpPrimary">
            Model Monitoring
          </Heading>
          <Text mb={4}>
            Access our real-time model monitoring dashboards to view analytics and performance metrics.
          </Text>
          <Flex 
            direction={{ base: "column", md: "row" }}
            gap={4}
            justify="center"
          >
            <Button
              leftIcon={<FiMonitor />}
              rightIcon={<FiExternalLink />}
              colorScheme="red"
              onClick={() => openExternalModel(fireModelUrl)}
              size="lg"
              minW="200px"
            >
              Monitor Smoke Detection Model
            </Button>
            <Button
              leftIcon={<FiShield />}
              rightIcon={<FiExternalLink />}
              colorScheme="blue"
              onClick={() => openExternalModel(ppeComplianceModelUrl)}
              size="lg"
              minW="200px"
            >
              Monitor PPE Compliance
            </Button>
            <Button
              leftIcon={<FiMapPin />}
              rightIcon={<FiExternalLink />}
              colorScheme="purple"
              onClick={() => openExternalModel(roiModelUrl)}
              size="lg"
              minW="200px"
            >
              Monitor ROI Model
            </Button>
          </Flex>
        </Box>

        {/* Tabs for Videos and Logs */}
        <Tabs colorScheme="purple" variant="enclosed" mb={6}>
          <TabList>
            <Tab>ROI/Smoke/PPE Videos</Tab>
            <Tab>RFID/Smoke/PPE Logs</Tab>
          </TabList>

          <TabPanels>
            {/* ROI Videos Tab */}
            <TabPanel p={0} mt={4}>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="md" color="edpPrimary">
                  ROI/Smoke/PPE Videos
                </Heading>
                <Button
                  leftIcon={<FiUpload />}
                  colorScheme="purple"
                  bg="edpSecondary"
                  color="white"
                  onClick={onVideoUploadOpen}
                  _hover={{ bg: '#bf0055' }}
                >
                  Upload ROI Video
                </Button>
              </Flex>

              {loadingVideos ? (
                <Center p={10}>
                  <Spinner size="xl" color="edpPrimary" />
                </Center>
              ) : videoError ? (
                <Center p={10}>
                  <Text color="red.500">{videoError}</Text>
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
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {videos.length === 0 ? (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={10}>
                              <Text fontSize="lg" color="gray.500">No ROI videos found</Text>
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

                  {/* Video Pagination */}
                  {videoTotalPages > 1 && (
                    <Flex justify="center" mt={6}>
                      <HStack spacing={2}>
                        <Button
                          disabled={videoPage === 1}
                          onClick={() => handleVideoPageChange(videoPage - 1)}
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Text>
                          Page {videoPage} of {videoTotalPages}
                        </Text>
                        <Button
                          disabled={videoPage === videoTotalPages}
                          onClick={() => handleVideoPageChange(videoPage + 1)}
                          size="sm"
                        >
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  )}
                </>
              )}
            </TabPanel>

            {/* RFID Logs Tab */}
            <TabPanel p={0} mt={4}>
              <Flex 
                justify="space-between" 
                align={{ base: "stretch", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={{ base: 4, md: 0 }}
                mb={6}
              >
                <Heading size="md" color="edpPrimary">
                  RFID/Smoke/PPE Logs
                </Heading>
                <Button
                  leftIcon={<FiUpload />}
                  colorScheme="purple"
                  bg="edpSecondary"
                  color="white"
                  onClick={onLogUploadOpen}
                  _hover={{ bg: '#bf0055' }}
                >
                  Upload Log File
                </Button>
              </Flex>

              {loadingLogs ? (
                <Center p={10}>
                  <Spinner size="xl" color="edpPrimary" />
                </Center>
              ) : logError ? (
                <Center p={10}>
                  <Text color="red.500">{logError}</Text>
                </Center>
              ) : (
                <>
                  <Box overflowX="auto">
                    <Table variant="simple" bg="white" borderRadius="md" boxShadow="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>ID</Th>
                          <Th>Filename</Th>
                          <Th>Size</Th>
                          <Th>Format</Th>
                          <Th>Upload Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {logs.length === 0 ? (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={10}>
                              <Text fontSize="lg" color="gray.500">No log files found</Text>
                            </Td>
                          </Tr>
                        ) : (
                          logs.map((log) => (
                            <Tr key={log.file_id}>
                              <Td>{log.file_id}</Td>
                              <Td>
                                <Text noOfLines={1} maxW="200px">
                                  {log.original_filename}
                                </Text>
                              </Td>
                              <Td>{formatFileSize(log.size_bytes)}</Td>
                              <Td>{log.format}</Td>
                              <Td>{formatDate(log.upload_date)}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<FiEye />}
                                    aria-label="View log"
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => handleViewLog(log)}
                                  />
                                  <IconButton
                                    icon={<FiDownload />}
                                    aria-label="Download log"
                                    colorScheme="green"
                                    variant="ghost"
                                    onClick={() => handleDownloadLog(log)}
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
                                        onClick={() => handleDeleteLog(log.file_id)}
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

                  {/* Log Pagination */}
                  {logTotalPages > 1 && (
                    <Flex justify="center" mt={6}>
                      <HStack spacing={2}>
                        <Button
                          disabled={logPage === 1}
                          onClick={() => handleLogPageChange(logPage - 1)}
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Text>
                          Page {logPage} of {logTotalPages}
                        </Text>
                        <Button
                          disabled={logPage === logTotalPages}
                          onClick={() => handleLogPageChange(logPage + 1)}
                          size="sm"
                        >
                          Next
                        </Button>
                      </HStack>
                    </Flex>
                  )}
                </>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Video Modal */}
        <Modal isOpen={isVideoModalOpen} onClose={onVideoModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedVideo?.original_filename || "ROI Video Player"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedVideo && (
                <Box borderRadius="md" overflow="hidden" position="relative">
                  <video 
                    ref={videoRef}
                    controls 
                    width="100%" 
                    autoPlay
                    src={streamUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <IconButton
                    icon={<FiMaximize />}
                    aria-label="Fullscreen"
                    position="absolute"
                    bottom="10px"
                    right="10px"
                    colorScheme="blue"
                    size="sm"
                    opacity="0.8"
                    _hover={{ opacity: 1 }}
                    onClick={handleFullscreen}
                  />
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                leftIcon={<FiMaximize />}
                colorScheme="blue" 
                mr={3} 
                onClick={handleFullscreen}
              >
                Fullscreen
              </Button>
              <Button onClick={onVideoModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Log Content Modal */}
        <Modal isOpen={isLogModalOpen} onClose={onLogModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedLog?.original_filename || "Log Viewer"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box 
                bg="gray.50" 
                p={4} 
                borderRadius="md" 
                maxHeight="60vh" 
                overflow="auto"
                fontFamily="monospace"
                whiteSpace="pre-wrap"
              >
                {logContent || "No content available"}
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button 
                leftIcon={<FiDownload />}
                colorScheme="green" 
                mr={3} 
                onClick={() => selectedLog && handleDownloadLog(selectedLog)}
              >
                Download
              </Button>
              <Button onClick={onLogModalClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Upload Modals */}
        <RoiUploadForm 
          isOpen={isVideoUploadOpen} 
          onClose={onVideoUploadClose} 
          onUploaded={handleVideoUploaded}
        />
        
        <LogUploadForm 
          isOpen={isLogUploadOpen} 
          onClose={onLogUploadClose} 
          onUploaded={handleLogUploaded}
        />
      </Box>
    </>
  );
}

export default RoiList;