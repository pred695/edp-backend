import React from 'react';
import {
  Box,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InventoryInsights from '../components/InventoryInsights';
import useAuthStore from '../store/AuthStore';

function InventoryAnalytics() {
  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));
  
  const navigate = useNavigate();
  const toast = useToast();

  React.useEffect(() => {
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
    }
  }, [isAuth, navigate, toast]);

  return (
    <>
      <Helmet>
        <title>EDP - Inventory Analytics</title>
        <meta name="description" content="Inventory analytics and insights" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={2} color="edpPrimary">
          Inventory Analytics
        </Heading>
        <Text mb={6} color="gray.600">
          Visualize and analyze your inventory data to make informed decisions
        </Text>
        
        <InventoryInsights />
      </Box>
    </>
  );
}

export default InventoryAnalytics;