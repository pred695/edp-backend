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
  } from '@chakra-ui/react';
  import React, { useEffect, useState } from 'react';
  import { Helmet } from 'react-helmet-async';
  import { FiBox, FiUser } from 'react-icons/fi';
  import { useNavigate } from 'react-router-dom';
  import Navbar from '../components/Navbar';
  import useAuthStore from '../store/AuthStore';
  
  function Dashboard() {
    const [loading, setLoading] = useState(false);
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
      }
    }, [isAuth, navigate, toast]);
  
    if (loading) {
      return (
        <Center h="100vh">
          <Spinner size="xl" />
        </Center>
      );
    }
  
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
                Welcome to EDP Dashboard
              </Heading>
              <Text fontSize="lg">
                Hello, <b>{userName}</b>! This is the Enterprise Data Platform dashboard. 
                It provides tools for inventory management and tracking using RFID technology.
              </Text>
            </CardBody>
          </Card>
  
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
                  <StatNumber fontSize="2xl">0</StatNumber>
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
            >
              <Flex justifyContent="space-between">
                <Box pl={{ base: 2, md: 4 }}>
                  <StatLabel fontWeight="medium">Active Users</StatLabel>
                  <StatNumber fontSize="2xl">1</StatNumber>
                </Box>
                <Box
                  my="auto"
                  color="edpPrimary"
                  alignContent="center"
                >
                  <FiUser size="3em" />
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
        </Box>
      </>
    );
  }
  
  export default Dashboard;