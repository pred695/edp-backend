import React, { useEffect, useState } from 'react';
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
  useDisclosure,
  Select,
  Input,
  IconButton,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiFilter, FiRefreshCw, FiEye, FiCalendar, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuthStore from '../store/AuthStore';
import { getItems } from '../utils/api';
import AddItemForm from '../components/AddItemForm';
import ItemDetail from '../components/ItemDetail';

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  // eslint-disable-next-line
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [perishableFilter, setPerishableFilter] = useState('');
  const [expiredFilter, setExpiredFilter] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  // Add sort state variables
  const [sortBy, setSortBy] = useState('timestamp_in');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for newest first

  const { isAuth } = useAuthStore((state) => ({
    isAuth: state.isAuth,
  }));

  const { 
    isOpen: isAddItemOpen, 
    onOpen: onAddItemOpen, 
    onClose: onAddItemClose 
  } = useDisclosure();
  
  const { 
    isOpen: isItemDetailOpen, 
    onOpen: onItemDetailOpen, 
    onClose: onItemDetailClose 
  } = useDisclosure();
  
  const navigate = useNavigate();
  const toast = useToast();

  const fetchItems = async (pageNum = page, limitNum = limit, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: limitNum,
        ...filters,
        // Add sorting parameters
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      // Add category filter if set
      if (categoryFilter) {
        params.category = categoryFilter;
      }
      
      // Add perishable filter if set
      if (perishableFilter !== '') {
        params.perishable = perishableFilter;
      }
      
      // Add expired filter if set
      if (expiredFilter !== '') {
        params.expired = expiredFilter;
      }

      const response = await getItems(params);
      setItems(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      toast({
        title: 'Error',
        description: 'Failed to fetch items',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
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
    
    // Check for URL parameters
    const queryParams = new URLSearchParams(window.location.search);
    const showExpired = queryParams.get('expired');
    
    if (showExpired === 'true') {
      setExpiredFilter('true');
      fetchItems(1, limit, { expired: 'true' });
    } else {
      fetchItems();
    }
  }, [isAuth, navigate, toast]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchItems(newPage, limit);
  };

  const handleFilterApply = () => {
    setPage(1); // Reset to first page when applying filters
    fetchItems(1, limit);
  };

  const handleRefresh = () => {
    fetchItems();
  };

  const handleItemAdded = () => {
    // Refresh the items list after adding a new item
    fetchItems();
    onAddItemClose();
  };

  const handleViewItemDetails = (itemId) => {
    setSelectedItemId(itemId);
    onItemDetailOpen();
  };

  // Add handler for changing sort
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Add handler for toggling sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Apply sort when either sort field or direction changes
  useEffect(() => {
    if (isAuth) {
      fetchItems();
    }
  }, [sortBy, sortOrder]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Helmet>
        <title>EDP - Items</title>
        <meta name="description" content="View and manage items" />
      </Helmet>
      <Navbar />
      <Box pt="6rem" px={{ base: 4, md: 8 }}>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg" color="edpPrimary">
            Inventory Items
          </Heading>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="purple"
            bg="edpSecondary"
            color="white"
            onClick={onAddItemOpen}
            _hover={{ bg: '#bf0055' }}
          >
            Add New Item
          </Button>
        </Flex>

        {/* Filters */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          mb={6} 
          gap={4}
          p={4}
          bg="white"
          borderRadius="md"
          boxShadow="sm"
        >
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Category</Text>
            <Input 
              placeholder="Filter by category" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </Box>
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Perishable</Text>
            <Select 
              placeholder="All items" 
              value={perishableFilter}
              onChange={(e) => setPerishableFilter(e.target.value)}
            >
              <option value="true">Perishable</option>
              <option value="false">Non-perishable</option>
            </Select>
          </Box>
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Expiry Status</Text>
            <Select 
              placeholder="All items" 
              value={expiredFilter}
              onChange={(e) => setExpiredFilter(e.target.value)}
            >
              <option value="true">Expired</option>
              <option value="false">Not Expired</option>
            </Select>
          </Box>
          {/* Add Sort By dropdown */}
          <Box flex="1">
            <Text mb={2} fontWeight="medium">Sort By</Text>
            <Flex>
              <Select 
                value={sortBy}
                onChange={handleSortChange}
                mr={2}
              >
                <option value="timestamp_in">Date Added</option>
                <option value="id">ID</option>
                <option value="category">Category</option>
                <option value="weight">Weight</option>
                <option value="expiry_date">Expiry Date</option>
              </Select>
              <IconButton
                icon={sortOrder === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
                onClick={toggleSortOrder}
                colorScheme={sortOrder === 'desc' ? "purple" : "gray"}
                variant="outline"
              />
            </Flex>
          </Box>
          <Box display="flex" alignItems="flex-end">
            <Button
              leftIcon={<FiFilter />}
              colorScheme="blue"
              onClick={handleFilterApply}
              mb={{ base: 0, md: '4px' }}
            >
              Apply Filters
            </Button>
          </Box>
          <Box display="flex" alignItems="flex-end">
            <IconButton
              icon={<FiRefreshCw />}
              aria-label="Refresh items"
              onClick={handleRefresh}
              colorScheme="gray"
              mb={{ base: 0, md: '4px' }}
            />
          </Box>
        </Flex>

        {loading ? (
          <Center p={10}>
            <Spinner size="xl" color="edpPrimary" />
          </Center>
        ) : error ? (
          <Center p={10}>
            <Text color="red.500">{error}</Text>
          </Center>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple" bg="white" borderRadius="md" boxShadow="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>ID</Th>
                    <Th>Category</Th>
                    <Th>Weight</Th>
                    <Th>Perishable</Th>
                    <Th>Expiry Date</Th>
                    <Th>RFID</Th>
                    <Th>Status</Th>
                    <Th>
                      {/* Add Date column with visual indicator for current sort */}
                      {sortBy === 'timestamp_in' ? (
                        <Flex align="center">
                          Date Added
                          <Icon 
                            as={sortOrder === 'asc' ? FiArrowUp : FiArrowDown} 
                            ml={1} 
                            color="edpSecondary"
                          />
                        </Flex>
                      ) : "Date Added"}
                    </Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.length === 0 ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={10}>
                        <Text fontSize="lg" color="gray.500">No items found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    items.map((item) => (
                      <Tr key={item.id}>
                        <Td>{item.id}</Td>
                        <Td>{item.category}</Td>
                        <Td>{item.weight}</Td>
                        <Td>
                          <Badge colorScheme={item.perishable ? "orange" : "green"}>
                            {item.perishable ? "Yes" : "No"}
                          </Badge>
                        </Td>
                        <Td>{formatDate(item.expiry_date)}</Td>
                        <Td>{item.rfid}</Td>
                        <Td>
                          <Badge colorScheme={item.timestamp_out ? "red" : "blue"}>
                            {item.timestamp_out ? "Out" : "In Stock"}
                          </Badge>
                        </Td>
                        <Td>{formatDate(item.timestamp_in)}</Td>
                        <Td>
                          <IconButton
                            icon={<FiEye />}
                            aria-label="View item details"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleViewItemDetails(item.id)}
                          />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            <Flex justify="center" mt={6}>
              <HStack spacing={2}>
                <Button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  size="sm"
                >
                  Previous
                </Button>
                <Text>
                  Page {page} of {totalPages}
                </Text>
                <Button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  size="sm"
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          </>
        )}
      </Box>

      {/* Add Item Form Modal */}
      <AddItemForm isOpen={isAddItemOpen} onClose={onAddItemClose} onItemAdded={handleItemAdded} />
      
      {/* Item Detail Modal */}
      <ItemDetail 
        isOpen={isItemDetailOpen} 
        onClose={onItemDetailClose} 
        itemId={selectedItemId}
        onItemUpdated={handleRefresh}
      />
    </>
  );
}

export default Items;