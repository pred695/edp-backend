import {
    Avatar,
    Box,
    Button,
    Flex,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Spacer,
    Tag,
    TagLabel,
    Text,
    useToast,
  } from '@chakra-ui/react';
  import React from 'react';
  import { BiLogOut, BiUserCheck, BiUserPlus } from 'react-icons/bi';
  import { GiHamburgerMenu } from 'react-icons/gi';
  import { Link, useNavigate } from 'react-router-dom';
  import useAuthStore from '../store/AuthStore';
  import { logout } from '../utils/api';
  
  function Navbar() {
    const {
      isAuth,
      removeAuth,
      userName,
      setUserName,
      setUserEmail,
      setUserRole,
    } = useAuthStore((state) => ({
      isAuth: state.isAuth,
      userName: state.userName,
      removeAuth: state.removeAuth,
      setUserName: state.setUserName,
      setUserEmail: state.setUserEmail,
      setUserRole: state.setUserRole,
    }));
    const navigate = useNavigate();
    const toast = useToast();
  
    const logOut = async () => {
      try {
        await logout();
        toast({
          title: 'Success',
          description: 'User Logged Out Successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
          position: 'top',
        });
        removeAuth();
        setUserName('');
        setUserEmail('');
        setUserRole('');
        navigate('/');
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Unauthorized',
          status: 'error',
          duration: 2000,
          isClosable: true,
          position: 'top',
          onCloseComplete: () => {
            navigate('/login');
          },
        });
        removeAuth();
      }
    };
  
    return (
      <Flex
        align="center"
        w="100%"
        position="fixed"
        top="0%"
        h={['50px', '55px', '70px']}
        boxShadow="0px 2px 3px lightgray"
        pr={['15px', '30px']}
        bgColor="white"
        zIndex="1"
      >
        <Link to="/">
          <Text
            color="edpPrimary"
            fontWeight="600"
            fontSize={['1.5rem', '1.7rem', '2.3rem', '2.7rem']}
            ml={['20px', '30px', '40px', '50px']}
          >
            EDP
          </Text>
        </Link>
        <Spacer />
        <Flex display={{ base: 'none', md: 'block' }}>
          {isAuth ? (
            <Flex justify="center" align="center" gap="1.5rem">
              <Link to="/dashboard">
                <Tag
                  size="lg"
                  cursor="pointer"
                  borderRadius="full"
                  py="0.4rem"
                  px="1rem"
                  _hover={{
                    bg: '#dbdbdb',
                  }}
                  transition="0.2s"
                >
                  <Flex align="center" my="0.025rem">
                    <Avatar name={userName} size="sm" ml={-1} mr={2} />
                    <TagLabel>
                      <Text
                        color="edpPrimary"
                        fontWeight="600"
                        fontSize={['0.4rem', '0.5rem', '0.8rem', '1.2rem']}
                        _hover={{
                          bg: '#dbdbdb',
                          color: 'edpSecondary',
                        }}
                      >
                        Account
                      </Text>
                    </TagLabel>
                  </Flex>
                </Tag>
              </Link>
              <Button
                borderRadius="0.5rem"
                fontSize="1.1rem"
                px="2rem"
                color="edpPrimary"
                _hover={{
                  bg: '#dbdbdb',
                  color: 'edpSecondary',
                }}
                onClick={logOut}
              >
                Log Out
              </Button>
            </Flex>
          ) : (
            <Flex>
              <Button
                borderRadius="0.5rem"
                fontSize="1.1rem"
                px="2rem"
                _hover={{
                  color: 'edpSecondary',
                }}
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                bg="edpSecondary"
                color="#ffffff"
                fontSize="1.1rem"
                px="2rem"
                ml="1.5rem"
                _hover={{ bg: '#bf0055' }}
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </Flex>
          )}
        </Flex>
  
        {/* For Mobile Viewport */}
        <Flex display={{ base: 'block', md: 'none' }}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              border="none"
              icon={<GiHamburgerMenu size={30} color="#584bac" />}
              variant="outline"
              bg="transparent"
            />
            {isAuth ? (
              <MenuList fontSize="1.1rem">
                <Link to="/dashboard">
                  <MenuItem icon={<Avatar name={userName} size="sm" />}>
                    Dashboard
                  </MenuItem>
                </Link>
                <MenuItem
                  icon={<BiLogOut size={24} color="#584bac" />}
                  onClick={() => logOut()}
                >
                  Logout
                </MenuItem>
              </MenuList>
            ) : (
              <MenuList>
                <MenuItem
                  icon={<BiUserCheck size={24} color="#584bac" />}
                  onClick={() => navigate('/login')}
                >
                  Log In
                </MenuItem>
                <MenuItem
                  icon={<BiUserPlus size={24} color="#584bac" />}
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </MenuItem>
              </MenuList>
            )}
          </Menu>
        </Flex>
      </Flex>
    );
  }
  
  export default Navbar;