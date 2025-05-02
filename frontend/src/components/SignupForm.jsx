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
  import { signup } from '../utils/api';
  
  export default function SignupForm() {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const emailRef = useRef(null);
    const confirmPasswordRef = useRef(null);
  
    const {
      addAuth,
      setUserName,
      setUserEmail,
    } = useAuthStore((state) => ({
      addAuth: state.addAuth,
      setUserName: state.setUserName,
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
        email: emailRef.current.value,
        password: passwordRef.current.value,
        confirmPassword: confirmPasswordRef.current.value,
      };
  
      if (
        !(
          credentials.email &&
          credentials.password &&
          credentials.username &&
          credentials.confirmPassword
        )
      ) {
        handleToast('Incomplete Entries', 'Please fill all the fields', 'error');
        return;
      }
      if (credentials.password !== credentials.confirmPassword) {
        handleToast(
          'Password Mismatch',
          'Password and Confirm Password do not match',
          'error'
        );
        return;
      }
      setLoading(true);
      try {
        await signup(credentials);
  
        addAuth();
        setUserName(credentials.username);
        setUserEmail(credentials.email);
        
        handleToast(
          'Account Created',
          'You have successfully created an account',
          'success'
        );
        navigate('/dashboard');
        setLoading(false);
      } catch (err) {
        setLoading(false);
        let errorDescription = '';
        if (err.response && err.response.data && err.response.data.errors) {
          if (err.response.data.errors.username) {
            errorDescription += err.response.data.errors.username;
          } else if (err.response.data.errors.email) {
            errorDescription += err.response.data.errors.email;
          } else if (err.response.data.errors.password) {
            errorDescription += err.response.data.errors.password;
          }
        } else {
          errorDescription = 'An error occurred during signup';
        }
        handleToast('Error', errorDescription, 'error');
      }
    };
  
    return (
      <Stack align="center">
        <Text textAlign="center" fontSize={['1.7rem', '2.2rem']} fontWeight="600">
          Register With Us
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
            {/* Username */}
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
                  placeholder="Enter username..."
                />
              </Box>
            </Box>
            {/* Email */}
            <Box mb={['1rem', '1.5rem']}>
              <Text mb="0.5rem" fontSize="1.1rem">
                Email
              </Text>
              <Box bg="#ffffff" borderRadius="0.4rem">
                <Input
                  type="email"
                  focusBorderColor="edpSecondary"
                  bg="#ecedf6"
                  id="email"
                  name="email"
                  ref={emailRef}
                  placeholder="Enter email..."
                />
              </Box>
            </Box>
            {/* Password */}
            <Box mb={['1rem', '1.5rem']}>
              <Text mb="0.5rem" fontSize="1.1rem">
                Password
              </Text>
              <Box bg="#ffffff" borderRadius="0.4rem">
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    focusBorderColor="edpSecondary"
                    bg="#ecedf6"
                    id="password"
                    name="password"
                    ref={passwordRef}
                    placeholder="Enter password..."
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
            {/* Confirm Password */}
            <Box mb={['1rem', '1.5rem']}>
              <Text mb="0.5rem" fontSize="1.1rem">
                Confirm Password
              </Text>
              <Box bg="#ffffff" borderRadius="0.4rem">
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    focusBorderColor="edpSecondary"
                    bg="#ecedf6"
                    id="confirmPassword"
                    name="confirmPassword"
                    ref={confirmPasswordRef}
                    placeholder="Confirm password..."
                  />
                  <InputRightElement
                    onClick={() => {
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                  >
                    {showConfirmPassword ? (
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
                  letterSpacing={1}
                  mt={['1rem', '']}
                  px="2rem"
                  fontSize="1rem"
                  bg="edpSecondary"
                  color="white"
                  _hover={{
                    bg: '#bf0055',
                  }}
                  rightIcon={<HiArrowLongRight color="#ffffff" size="1.5rem" />}
                >
                  Create Account
                </Button>
              )}
            </Center>
          </form>
        </Flex>
        <Text textAlign="center" fontSize={['1.1rem', '1.2rem']}>
          Already have an account?{' '}
          <span
            style={{
              color: '#CE1567',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            <Link to="/login">Log In</Link>
          </span>
        </Text>
      </Stack>
    );
  }