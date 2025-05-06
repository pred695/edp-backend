import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
  VStack,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiBox, FiUser, FiDatabase, FiList, FiPlus, FiAlertTriangle, FiPieChart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InventoryInsights from '../components/InventoryInsights';
import useAuthStore from '../store/AuthStore';
import api from '../utils/api';

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    expiredItems: []
  });
  const { isAuth, userName } = useAuthStore((state) => ({
    isAuth: state.isAuth,
    userName: state.userName,
  }));
  
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!isAuth) {
      toast({
        title: 'Authentication required',
        description: 'Please login to access the dashboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      navigate('/login');
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [isAuth, navigate, toast]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get total items count
      const itemsResponse = await api.get('/items', { 
        params: { limit: 1 }
      });
      
      // Get expired items
      const expiredResponse = await api.get('/items/expired');
      
      setDashboardData({
        totalItems: itemsResponse.data.pagination.total,
        expiredItems: expiredResponse.data.items
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Helmet>
        <title>EDP - Dashboard</title>
        <meta name="description" content="EDP Dashboard" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Card mb={6} variant="outline">
          <CardBody>
            <Heading size="lg" mb={6} color="edpPrimary">
              Welcome to SeWa
            </Heading>
            <Text fontSize="lg" mb={6}>
              Hello, <b>{userName}</b>! This is SeWa(Secured Warehouse Management System).
              Your Warehouse, Secured and Simplified.
            </Text>
            
            <Flex justifyContent="center" mt={4}>
              <HStack spacing={4}>
                <Button
                  leftIcon={<FiList />}
                  colorScheme="purple"
                  size="lg"
                  onClick={() => navigate('/items')}
                >
                  View Items
                </Button>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="teal"
                  size="lg"
                  onClick={() => navigate('/items')}
                >
                  Add New Item
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Expired Items Alert */}
        {dashboardData.expiredItems.length > 0 && (
          <Alert 
            status="warning" 
            variant="solid"
            mb={6}
            borderRadius="md"
            flexDirection="column"
            alignItems="flex-start"
          >
            <Flex w="100%" alignItems="center" mb={2}>
              <AlertIcon />
              <AlertTitle mr={2}>Expired Items Alert!</AlertTitle>
              <AlertDescription>
                There are {dashboardData.expiredItems.length} expired items in the inventory.
              </AlertDescription>
            </Flex>
            <Box 
              w="100%" 
              maxH="150px" 
              overflowY="auto" 
              p={2} 
              bg="orange.50" 
              color="black" 
              borderRadius="md"
            >
              {dashboardData.expiredItems.map(item => (
                <HStack key={item.id} mb={1} justify="space-between" p={1} bg="white" borderRadius="sm">
                  <Text fontWeight="medium">{item.category}</Text>
                  <Badge colorScheme="red">
                    Expired: {formatDate(item.expiry_date)}
                  </Badge>
                </HStack>
              ))}
            </Box>
            <Button 
              mt={3} 
              colorScheme="orange" 
              size="sm"
              onClick={() => navigate('/items?expired=true')}
            >
              View All Expired Items
            </Button>
          </Alert>
        )}

        <Tabs colorScheme="purple" variant="enclosed" mb={6}>
          <TabList>
            <Tab>Overview</Tab>
            <Tab>Inventory Insights</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
                <Stat
                  px={{ base: 4, md: 6 }}
                  py="5"
                  shadow="md"
                  border="1px"
                  borderColor="gray.200"
                  rounded="lg"
                  bg="white"
                >
                  <Flex justifyContent="space-between">
                    <Box pl={{ base: 2, md: 4 }}>
                      <StatLabel fontWeight="medium">Total Items</StatLabel>
                      <StatNumber fontSize="2xl">{dashboardData.totalItems}</StatNumber>
                    </Box>
                    <Box
                      my="auto"
                      color="edpSecondary"
                      alignContent="center"
                    >
                      <FiBox size="3em" />
                    </Box>
                  </Flex>
                </Stat>
                
                <Stat
                  px={{ base: 4, md: 6 }}
                  py="5"
                  shadow="md"
                  border="1px"
                  borderColor="gray.200"
                  rounded="lg"
                  bg="white"
                  position="relative"
                  overflow="hidden"
                  onClick={() => navigate('/items?expired=true')}
                  cursor="pointer"
                  _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
                >
                  <Flex justifyContent="space-between">
                    <Box pl={{ base: 2, md: 4 }}>
                      <StatLabel fontWeight="medium">Expired Items</StatLabel>
                      <StatNumber fontSize="2xl">{dashboardData.expiredItems.length}</StatNumber>
                    </Box>
                    <Box
                      my="auto"
                      color="red.500"
                      alignContent="center"
                    >
                      <FiAlertTriangle size="3em" />
                    </Box>
                  </Flex>
                  {dashboardData.expiredItems.length > 0 && (
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      bg="red.500"
                      h="4px"
                      animation="pulse 2s infinite"
                      sx={{
                        "@keyframes pulse": {
                          "0%": { opacity: 0.4 },
                          "50%": { opacity: 1 },
                          "100%": { opacity: 0.4 }
                        }
                      }}
                    />
                  )}
                </Stat>
                
                <Stat
                  px={{ base: 4, md: 6 }}
                  py="5"
                  shadow="md"
                  border="1px"
                  borderColor="gray.200"
                  rounded="lg"
                  bg="white"
                  onClick={() => navigate('/items')}
                  cursor="pointer"
                  _hover={{ transform: 'translateY(-5px)', transition: 'transform 0.3s' }}
                >
                  <Flex justifyContent="space-between">
                    <Box pl={{ base: 2, md: 4 }}>
                      <StatLabel fontWeight="medium">Manage Inventory</StatLabel>
                      <StatNumber fontSize="2xl">Go</StatNumber>
                    </Box>
                    <Box
                      my="auto"
                      color="edpSecondary"
                      alignContent="center"
                    >
                      <FiDatabase size="3em" />
                    </Box>
                  </Flex>
                </Stat>
              </SimpleGrid>

              <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                borderRadius="lg"
                bg="white"
                mb={6}
              >
                <Heading size="md" mb={4} color="edpPrimary">
                  Getting Started
                </Heading>
                <Text mb={4}>
                  Welcome to the EDP dashboard. This platform allows you to:
                </Text>
                <Box as="ul" pl={5} mb={4}>
                  <Box as="li" pb={1}>Track inventory with RFID technology</Box>
                  <Box as="li" pb={1}>Monitor item status and location</Box>
                  <Box as="li" pb={1}>Generate reports and analyze data</Box>
                </Box>
                <Text>
                  More features coming soon!
                </Text>
              </Box>
            </TabPanel>
            
            <TabPanel px={0}>
              <InventoryInsights />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}

export default Dashboard;