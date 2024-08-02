'use client' // this is a client-side file used for client side app 
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, getDoc, getDocs, query, setDoc, doc, deleteDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]); // helper function to store inventory data 
  const [open, setOpen] = useState(false); // helper function to add and remove items 
  const [itemName, setItemName] = useState(''); // store the name of the item we type out
  const [searchTerm, setSearchTerm] = useState(''); // store the name of the item we type out

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  }

  const updateInventory = async () => { //async wont block code when running, if code is blocked then website will freeze
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

  const addItem = async (item) => {
    const formattedItem = item.toLowerCase(); // this is for cases like Boxes and BOxES to be treated as the same item
    const docRef = doc(collection(firestore, 'inventory'), formattedItem);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const formattedItem = item.toLowerCase(); // this is for cases like Boxes and BOxES to be treated as the same item
    const docRef = doc(collection(firestore, 'inventory'), formattedItem);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => { // it runs the above whenever the dependencies of the array change, this means it will run when the page loads.
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const filterInv = inventory.filter(item => // use to filter the inventory 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2}>
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
            transform: 'translate(-50%, -50%)', // directly applied as styles instead of prebuilt props
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)} // this is a function that will be called when the value of the textfield changes
            ></TextField>
            <Button variant="outlined" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Add New Item 
      </Button>
      <TextField // Search Bar
        label="Search"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Box border='1px solid #333' borderRadius="8px" overflow="hidden">
        <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center">
          <Typography variant="h2" color = '#333'> Inventory Management</Typography>
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
  );
}
