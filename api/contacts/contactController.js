import asyncHandler from "express-async-handler";
import Contact from "./ContactModel.js";
import checkRequired from "../../utils/checkRequired.js";

// @desc    Fetch all contacts
// @route   GET /api/contacts
// @access  Public
const getContacts = asyncHandler(async (req, res) => {
  try {
    const pageSize = Number(process.env.LIMIT) || 10;
    const page = Number(req.query.pageNumber) || 1;
    let searchParams = {};
    searchParams["published_status"] = "PUBLISHED";
    if (req.query.search) {
      const searchQ = req.query.search;
      const newQData = {};
      Object.keys(searchQ).map((item) => {
        newQData[item] = {
          $regex: searchQ[item],
          $options: "i",
        };
      });
      searchParams = { ...searchParams, ...newQData };
    }
    if (req.query.exact) {
      const exactQ = req.query.exact;
      searchParams = { ...searchParams, ...exactQ };
    }
    if (req.query.conditional) {
      const conditionalQ = req.query.conditional;
      searchParams = { ...searchParams, ...conditionalQ };
    }
  const count = await Contact.countDocuments({ ...searchParams });
  const contacts = await Contact.find({ ...searchParams })
    .limit(pageSize)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name")
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ contacts, page, pages: Math.ceil(count / pageSize), count: count });
  } catch (error) {
    console.log(error)
    res.status(502);
    throw new Error("Something Went wrong");
  }
  
});
// @desc    Fetch all contacts
// @route   GET /api/contacts/all
// @access  Public
const getAllContacts = asyncHandler(async (req, res) => {
  try {
  const page = Number(req.query.pageNumber) || 1;
  let searchParams = {};
  searchParams["published_status"] = "PUBLISHED";
  if (req.query.term && req.query.value) {
    // searchParams[req.query.term] = req.query.value;
    searchParams[req.query.term] = {
      $regex: req.query.value,
      $options: "i",
    };
  }
  const contacts = await Contact.find({ ...searchParams }).limit(100).skip(100 * (page - 1)).sort({ createdAt: -1 });
  res.json(contacts);
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went wrong");
}
});

// @desc    Fetch single contact
// @route   GET /api/contacts/:id
// @access  Public
const getContactById = asyncHandler(async (req, res) => {
  try {
  const contact = await Contact.findById(req.params.id)
    .populate("created_by", "_id, name")
    .populate("updated_by", "_id, name");

  if (contact && contact.published_status === "PUBLISHED") {
    res.json(contact);
  } else {
    res.status(404);
    throw new Error("Contact not found");
  }
}
catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = asyncHandler(async (req, res) => {
  try {
  const contact = await Contact.findById(req.params.id);

  if (contact) {
    await contact.remove();
    res.json({ message: "Contact removed" });
  } else {
    res.status(404);
    throw new Error("Contact not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong");
}
});

// @desc    Create a contact
// @route   POST /api/contacts
// @access  Private/Admin
const createContact = asyncHandler(async (req, res) => {
  try {
    var data = checkRequired(req.body);
    if(req.user){
      data.created_by = req.user._id; 
    }
    const contact = new Contact(data);
    const createdContact = await contact.save();
    res.status(201).json(createdContact); 
  } catch (error) {
    res.status(502);
    throw new Error("Something Went Wrong. Please try again");
  }  
});

// @desc    Update a contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = asyncHandler(async (req, res) => {
  try {
    var feed = checkRequired(req.body);
    if(req.user){
      feed.updated_by = req.user._id;    
    }
   
  const data = await Contact.findById(req.params.id);
  if (data) {
    Object.keys(feed).map((item, index) => {
      data[item] = feed[item];
    });
    const updatedContact = await data.save();
    res.json(updatedContact);
  } else {
    res.status(404);
    throw new Error("Contact not found");
  }
} catch (error) {
  console.log(error);
  res.status(502);
  throw new Error("Something Went Wrong.");
}
});

export {
  getContacts,
  getContactById,
  deleteContact,
  createContact,
  updateContact,
  getAllContacts,
};
