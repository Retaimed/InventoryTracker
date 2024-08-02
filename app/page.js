'use client' // this is a client-side file used for client side app 
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, getDoc, getDocs, query, setDoc, doc, deleteDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]); // helper function to store inventory data 
  const [open, setOpen] = useState(false); // helper function to add and remove items 
  const [openRemoveModal, setOpenRemoveModal] = useState(false); // control remove modal
  const [itemName, setItemName] = useState(''); // store the name of the item we type out
  const [quantity, setQuantity] = useState(1); // store the quantity of the item to be added
  const [removeQuantity, setRemoveQuantity] = useState(1); // store the quantity to be removed
  const [searchTerm, setSearchTerm] = useState(''); // store the name of the item we type out
  const [itemError, setItemError] = useState(''); // store error message for item name

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  }

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const InventoryList = [];
    docs.forEach((doc) => {
      InventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(InventoryList);
  };

  const validateQuantity = (qty) => {
    const parsedQty = parseInt(qty);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      return 1;
    }
    return parsedQty;
  };

  const validateItemName = (name) => {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name);
  };

  const addItem = async (item, qty = 1) => {
    try {
      if (!item) {
        throw new Error('Item name cannot be empty');
      }

      if (!validateItemName(item)) {
        throw new Error('Item name can only contain letters and spaces');
      }

      const validatedQty = validateQuantity(qty);

      const formattedItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'inventory'), formattedItem);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + validatedQty });
      } else {
        await setDoc(docRef, { quantity: validatedQty });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error.message);
      alert(error.message);
    }
  };

  const removeItem = async (item, qty = 1) => {
    try {
      const formattedItem = item.toLowerCase();
      const docRef = doc(collection(firestore, 'inventory'), formattedItem);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity <= qty) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - qty });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setQuantity(1);
    setItemError('');
  };

  const handleOpenRemoveModal = () => setOpenRemoveModal(true);
  const handleCloseRemoveModal = () => {
    setOpenRemoveModal(false);
    setRemoveQuantity(1);
  };

  const handleItemNameChange = (e) => {
    const value = e.target.value;
    if (validateItemName(value)) {
      setItemName(value);
      setItemError('');
    } else {
      setItemError('Item name can only contain letters and spaces');
    }
  };

  const filterInv = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="space-between" alignItems="center" gap={2}>
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
        <Modal
          open={open}
          onClose={handleClose}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={handleItemNameChange}
                error={!!itemError}
                helperText={itemError}
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(validateQuantity(e.target.value))}
              />
              <Button variant="outlined" onClick={() => {
                addItem(itemName, quantity);
                setItemName('');
                setQuantity(1);
                handleClose();
              }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Modal
          open={openRemoveModal}
          onClose={handleCloseRemoveModal}
        >
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant="h6">Remove Items</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={handleItemNameChange}
                error={!!itemError}
                helperText={itemError}
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Quantity to Remove"
                type="number"
                value={removeQuantity}
                onChange={(e) => setRemoveQuantity(validateQuantity(e.target.value))}
              />
              <Button variant="outlined" onClick={() => {
                removeItem(itemName, removeQuantity);
                setRemoveQuantity(1);
                handleCloseRemoveModal();
              }}
              >
                Remove
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Button variant="contained" onClick={handleOpen}>
          Add New Item 
        </Button>
        <Button variant="contained" onClick={handleOpenRemoveModal}>
          Remove Item
        </Button>
        <TextField // Search Bar
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
        />
        <Box border='1px solid #333' borderRadius="8px" overflow="hidden">
          <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h2" color='#333'> Inventory Management</Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow="auto" p={2}>
            {filterInv.map(({ name, quantity }) => (
              <Box key={name} width="100%" minHeight="150px" display="flex" alignItems="center" justifyContent="space-between" bgcolor="#f0f0f0" padding={5} borderRadius="8px">
                <Typography variant='h3' color='#333' textAlign='center'> 
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant='h3' color='#333' textAlign='center'> 
                  {quantity}
                </Typography>
                <Stack direction='row' spacing={2}>
                  <Button variant="contained" onClick={() => addItem(name)}>
                    Add 
                  </Button>        
                  <Button variant="contained" onClick={() => removeItem(name)}>
                    Remove 
                  </Button> 
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
      <Box width="100%" bgcolor="#ADD8E6" p={2} textAlign="center">
        <Typography variant="h3" color="#333">
          © Created by Ryan Eshan
        </Typography>
      </Box>
    </Box>
  );
}