import React from 'react';
import { Box, Button, Center, Flex, Heading, Text } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/AuthStore';

function Home() {
  const navigate = useNavigate();
  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));

  return (
    <>
      <Helmet>
        <title>EDP - Enterprise Data Platform</title>
        <meta name="description" content="Enterprise Data Platform for efficient inventory management" />
      </Helmet>
      <Navbar />
      <Center h="90vh">
        <Flex
          direction="column"
          align="center"
          maxW="800px"
          textAlign="center"
          px={4}
        >
          <Heading 
            as="h1" 
            size="2xl" 
            color="edpPrimary"
            mb={6}
          >
            Enterprise Data Platform
          </Heading>
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            mb={10}
            maxW="600px"
          >
            A comprehensive solution for inventory management and tracking with RFID technology.
          </Text>
          <Flex 
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            {isAuth ? (
              <Button
                size="lg"
                bg="edpSecondary"
                color="white"
                _hover={{ bg: '#bf0055' }}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  bg="edpSecondary"
                  color="white"
                  _hover={{ bg: '#bf0055' }}
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="edpPrimary"
                  color="edpPrimary"
                  _hover={{
                    bg: 'edpPrimary',
                    color: 'white'
                  }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Center>
    </>
  );
}

export default Home;