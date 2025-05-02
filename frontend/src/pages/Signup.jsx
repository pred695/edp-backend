import { Box, Flex } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import SignupForm from '../components/SignupForm';

export default function Signup() {
  return (
    <>
      <Helmet>
        <title>EDP - Register</title>
        <meta name="description" content="Register for an EDP account" />
      </Helmet>
      <Navbar />
      <Flex
        justify="center"
        align="center"
        h="100vh"
        px={{ base: '0', xl: '2rem', '2xl': '0' }}
      >
        <SignupForm />
      </Flex>
    </>
  );
}