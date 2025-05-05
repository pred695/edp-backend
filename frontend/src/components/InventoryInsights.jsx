import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Spinner,
  Center,
  useToast,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  Badge,
  HStack,
} from '@chakra-ui/react';
import { getItems } from '../utils/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Custom colors for charts
const COLORS = ['#584BAC', '#CE1567', '#FF9800', '#4CAF50', '#03A9F4', '#9C27B0', '#F44336', '#009688'];

function InventoryInsights() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [perishableStats, setPerishableStats] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [expiringItems, setExpiringItems] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const toast = useToast();

  // Fetch all items
  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      try {
        // Get all items - use a higher limit to get most items
        const response = await getItems({ limit: 100 });
        setItems(response.data.items);
        setTotalItems(response.data.pagination.total);
        
        // Process data for visualizations
        processInventoryData(response.data.items);
      } catch (err) {
        console.error('Error fetching inventory data:', err);
        setError('Failed to fetch inventory data');
        toast({
          title: 'Error',
          description: 'Failed to fetch inventory data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [toast]);

  // Process inventory data for charts
  const processInventoryData = (items) => {
    // Extract unique categories
    const uniqueCategories = [...new Set(items.map(item => item.category))];
    setCategories(['All', ...uniqueCategories]);
    
    // Count items by category
    const categoryCount = {};
    items.forEach(item => {
      if (categoryCount[item.category]) {
        categoryCount[item.category]++;
      } else {
        categoryCount[item.category] = 1;
      }
    });
    
    // Transform for chart data
    const categoryData = Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category]
    }));
    setCategoryStats(categoryData);
    
    // Count perishable vs non-perishable
    const perishableCount = items.filter(item => item.perishable).length;
    const nonPerishableCount = items.length - perishableCount;
    
    setPerishableStats([
      { name: 'Perishable', value: perishableCount },
      { name: 'Non-Perishable', value: nonPerishableCount }
    ]);
    
    // Count expiring items (items with expiry_date in the past)
    const today = new Date();
    const expired = items.filter(item => {
      if (!item.expiry_date) return false;
      return new Date(item.expiry_date) < today;
    }).length;
    
    setExpiringItems(expired);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  // Calculate weight distribution
  const calculateWeightDistribution = () => {
    if (filteredItems.length === 0) return [];
    
    // Group items by weight ranges
    const weightRanges = {
      '0-10 kg': 0,
      '11-20 kg': 0,
      '21-50 kg': 0,
      '51-100 kg': 0,
      '100+ kg': 0
    };
    
    filteredItems.forEach(item => {
      const weight = Number(item.weight);
      if (weight <= 10) weightRanges['0-10 kg']++;
      else if (weight <= 20) weightRanges['11-20 kg']++;
      else if (weight <= 50) weightRanges['21-50 kg']++;
      else if (weight <= 100) weightRanges['51-100 kg']++;
      else weightRanges['100+ kg']++;
    });
    
    return Object.keys(weightRanges).map(range => ({
      name: range,
      value: weightRanges[range]
    })).filter(item => item.value > 0);
  };

  // Calculate properties distribution (dry and fragile)
  const calculatePropertiesDistribution = () => {
    if (filteredItems.length === 0) return [];
    
    const dryCount = filteredItems.filter(item => item.dry).length;
    const fragileCount = filteredItems.filter(item => item.fragile).length;
    
    return [
      { name: 'Dry', value: dryCount },
      { name: 'Fragile', value: fragileCount }
    ];
  };

  if (loading) {
    return (
      <Center p={10}>
        <Spinner size="xl" color="edpPrimary" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={5} bg="red.50" color="red.500" borderRadius="md">
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box mt={8}>
      <Heading size="lg" mb={6} color="edpPrimary">
        Inventory Insights
      </Heading>
      
      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Stat
          px={4}
          py={3}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          rounded="lg"
          bg="white"
        >
          <StatLabel fontWeight="medium" isTruncated>
            Total Items
          </StatLabel>
          <StatNumber fontSize="2xl" color="edpPrimary">
            {totalItems}
          </StatNumber>
          <StatHelpText>In Inventory</StatHelpText>
        </Stat>
        
        <Stat
          px={4}
          py={3}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          rounded="lg"
          bg="white"
        >
          <StatLabel fontWeight="medium" isTruncated>
            Categories
          </StatLabel>
          <StatNumber fontSize="2xl" color="edpPrimary">
            {categories.length - 1}
          </StatNumber>
          <StatHelpText>Different Types</StatHelpText>
        </Stat>
        
        <Stat
          px={4}
          py={3}
          shadow="md"
          border="1px"
          borderColor="gray.200"
          rounded="lg"
          bg="white"
        >
          <StatLabel fontWeight="medium" isTruncated>
            Perishable Items
          </StatLabel>
          <StatNumber fontSize="2xl" color="orange.500">
            {perishableStats.length > 0 ? perishableStats[0].value : 0}
          </StatNumber>
          <StatHelpText>Require Expiry Date</StatHelpText>
        </Stat>
        
        <Stat
          px={4}
          py={3}
          shadow="md"
          border="1px"
          borderColor="red.100"
          rounded="lg"
          bg="white"
          borderLeftWidth={expiringItems > 0 ? "4px" : "1px"}
          borderLeftColor={expiringItems > 0 ? "red.500" : "gray.200"}
        >
          <StatLabel fontWeight="medium" isTruncated>
            Expired Items
          </StatLabel>
          <StatNumber fontSize="2xl" color={expiringItems > 0 ? "red.500" : "gray.500"}>
            {expiringItems}
          </StatNumber>
          <StatHelpText>Needs Attention</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      {/* Category Filter */}
      <Flex justify="flex-end" mb={4}>
        <Box width="200px">
          <Select 
            value={selectedCategory}
            onChange={handleCategoryChange}
            bg="white"
            borderColor="gray.300"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Box>
      </Flex>
      
      {/* Charts Section */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
        {/* Category Distribution Chart */}
        <Box p={5} bg="white" shadow="md" borderRadius="lg">
          <Heading size="md" mb={4} color="edpPrimary">
            Category Distribution
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Perishable vs Non-Perishable */}
        <Box p={5} bg="white" shadow="md" borderRadius="lg">
          <Heading size="md" mb={4} color="edpPrimary">
            Perishable vs Non-Perishable
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={perishableStats}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#CE1567" />
                <Cell fill="#584BAC" />
              </Pie>
              <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Weight Distribution */}
        <Box p={5} bg="white" shadow="md" borderRadius="lg">
          <Heading size="md" mb={4} color="edpPrimary">
            Weight Distribution
            {selectedCategory !== 'All' && (
              <Badge ml={2} colorScheme="purple">{selectedCategory}</Badge>
            )}
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={calculateWeightDistribution()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
              <Legend />
              <Bar dataKey="value" name="Items" fill="#584BAC" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Item Properties */}
        <Box p={5} bg="white" shadow="md" borderRadius="lg">
          <Heading size="md" mb={4} color="edpPrimary">
            Item Properties
            {selectedCategory !== 'All' && (
              <Badge ml={2} colorScheme="purple">{selectedCategory}</Badge>
            )}
          </Heading>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={calculatePropertiesDistribution()}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
              <Legend />
              <Bar dataKey="value" name="Items" fill="#CE1567" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>
      
      {/* Inventory Summary */}
      <Box mt={8} p={5} bg="white" shadow="md" borderRadius="lg">
        <Heading size="md" mb={4} color="edpPrimary">
          Inventory Summary
        </Heading>
        <Text>
          Your inventory contains {totalItems} items across {categories.length - 1} different categories.
          {perishableStats.length > 0 && perishableStats[0].value > 0 && 
            ` There are ${perishableStats[0].value} perishable items in stock.`}
          {expiringItems > 0 && 
            ` Currently, ${expiringItems} items have expired and need attention.`}
        </Text>
        
        <HStack mt={4} spacing={4} flexWrap="wrap">
          {categories.slice(1).map(category => (
            <Badge key={category} colorScheme="purple" p={2} borderRadius="md">
              {category}
            </Badge>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}

export default InventoryInsights;