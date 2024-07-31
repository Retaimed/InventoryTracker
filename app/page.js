'use client' // this is a client-side file used for client side app 
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Typography } from "@mui/material";
import { collection, getDoc, query } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]); // helper function to store inventory data 
  const [open, setOpen] = useState(false); // helper function to add and remove items 
  const [itemName, setItemName] = useState(''); // store the name of the item we type out

  const updateInventory = async () => { //async wont block code when running, if code is blocked then website will freeze
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const InventoryList = []
      docs.forEach((doc) => {
        InventoryList.push({
          name: doc.id,
          ...doc.data(),
        })
      })
      setInventory(InventoryList);
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data; 
    } 
  }

  useEffect(() => { // it runs the above whenver the depedencies of the array changes, this means it will run when the page loads.
    updateInventory()
  }, [])
  
  return (
    <Box>
      <Typography variant = "h1">
        Inventory Management
      </Typography>
      {
        inventory.forEach((item) => {
          return(<>
          {item.name}
          {item.count}
          </>)
        })
      }
    </Box>
  );
}
