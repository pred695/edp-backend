import { Box, Center, Flex } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import LoginForm from '../components/LoginForm';
import Navbar from '../components/Navbar';

export default function Login() {
  return (
    <>
      <Helmet>
        <title>EDP - Login</title>
        <meta name="description" content="Login to your EDP account" />
      </Helmet>
      <Navbar />
      <Flex
        justify="center"
        align="center"
        h="100vh"
        px={{ base: '0', xl: '2rem', '2xl': '0' }}
      >
        <LoginForm />
      </Flex>
    </>
  );
}