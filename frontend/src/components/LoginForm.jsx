import {
  Box,
  Button,
  Center,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { BiHide, BiShow } from 'react-icons/bi';
import { HiArrowLongRight } from 'react-icons/hi2';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/AuthStore';
import { login } from '../utils/api';

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const {
    addAuth,
    setUserName,
    setUserRole,
    setUserEmail,
  } = useAuthStore((state) => ({
    addAuth: state.addAuth,
    setUserName: state.setUserName,
    setUserRole: state.setUserRole,
    setUserEmail: state.setUserEmail,
  }));
  
  const navigate = useNavigate();
  const toast = useToast();

  const handleToast = (title, description, status) => {
    toast({
      position: 'top',
      title,
      description,
      status,
      isClosable: true,
    });
  };
  
  const onSubmit = async (e) => {
    e.preventDefault();
    const credentials = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
    };

    if (!(credentials.username && credentials.password)) {
      handleToast('Incomplete Entries', 'Please fill all the fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await login(credentials);

      addAuth();
      setUserName(credentials.username);
      setUserRole(response.data.user.role);
      setUserEmail(response.data.user.email);

      handleToast('Success', 'Successfully logged in!', 'success');
      navigate('/dashboard');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      let errorDescription = '';
      if (err.response && err.response.data && err.response.data.errors) {
        if (err.response.data.errors.username) {
          errorDescription += err.response.data.errors.username;
        } else if (err.response.data.errors.password) {
          errorDescription += err.response.data.errors.password;
        }
      } else {
        errorDescription = 'An error occurred during login';
      }
      handleToast('Error', errorDescription, 'error');
    }
  };

  return (
    <Stack align="center">
      <Text textAlign="center" fontSize={['1.7rem', '2.2rem']} fontWeight="600">
        Log In
      </Text>
      <Flex
        direction="column"
        border="2px solid"
        borderColor="edpSecondary"
        w={['20rem', '27rem']}
        px={['1rem', '2rem']}
        py={['1rem', '2rem']}
        borderRadius="0.8rem"
        mb="1rem"
      >
        <form onSubmit={onSubmit}>
          <Box mb={['1rem', '1.5rem']}>
            <Text mb="0.5rem" fontSize="1.1rem">
              Username
            </Text>
            <Box bg="#ffffff" borderRadius="0.4rem">
              <Input
                type="text"
                focusBorderColor="edpSecondary"
                bg="#ecedf6"
                id="username"
                name="username"
                ref={usernameRef}
                placeholder="Enter your username..."
              />
            </Box>
          </Box>
          <Box mb="1rem">
            <Text mb="0.5rem" fontSize="1.1rem">
              Password
            </Text>
            <Box bg="#ffffff" borderRadius="0.4rem" mb={1}>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  focusBorderColor="edpSecondary"
                  bg="#ecedf6"
                  id="password"
                  name="password"
                  ref={passwordRef}
                  placeholder="Enter your password..."
                />
                <InputRightElement
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                >
                  {showPassword ? (
                    <BiHide
                      style={{ width: '20px', height: '20px' }}
                      color="#3d3d3d"
                    />
                  ) : (
                    <BiShow
                      style={{ width: '20px', height: '20px' }}
                      color="#3d3d3d"
                    />
                  )}
                </InputRightElement>
              </InputGroup>
            </Box>
          </Box>
          <Center>
            {loading ? (
              <Spinner />
            ) : (
              <Button
                type="submit"
                mt={['1rem', '']}
                px="2rem"
                bg="edpSecondary"
                color="#FFFFFF"
                _hover={{
                  bg: '#bf0055',
                }}
                rightIcon={<HiArrowLongRight color="#ffffff" size="1.5rem" />}
              >
                Log In
              </Button>
            )}
          </Center>
        </form>
      </Flex>
      <Text textAlign="center" fontSize={['1.1rem', '1.2rem']}>
        Don't have an account?{' '}
        <span
          style={{
            color: '#CE1567',
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          <Link to="/signup">Register</Link>
        </span>
      </Text>
    </Stack>
  )
  }