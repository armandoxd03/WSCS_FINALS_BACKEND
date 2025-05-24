const Product = require("../models/Product");

// Get all products (admin)
module.exports.getAll = (req, res) => {
    return Product.find()
        .then(products => res.status(200).send(products))
        .catch(err => res.status(500).send({ error: "Error in Find", details: err }));
};

// Get all active products (public)
module.exports.getAllActive = (req, res) => {
    return Product.find({ isActive: true })
        .then(products => res.status(200).send(products))
        .catch(err => res.status(500).send({ error: "Error in Find", details: err }));
};

// Add product (admin)
module.exports.addProduct = (req, res) => {
    let newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl
    });

    return newProduct.save()
        .then(product => res.status(201).send(product))
        .catch(err => res.status(500).send({ error: "Error in Save", details: err }));
};

// Get a specific product (public)
module.exports.getProduct = (req, res) => {
    return Product.findById(req.params.productId)
        .populate('likes', 'firstName lastName')
        .then(product => res.status(200).send(product))
        .catch(err => res.status(500).send({ error: "Error in Find", details: err }));
};

// Update product (admin)
module.exports.updateProduct = (req, res) => {
    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl
    };

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
        .then(product => res.status(200).send({
            message: 'Product updated successfully',
            updatedProduct: product
        }))
        .catch(err => res.status(500).send({ error: "Error in Saving", details: err }));
};

// Archive product (admin)
module.exports.archiveProduct = (req, res) => {
    let updateActiveField = { isActive: false };

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(archiveProduct => res.status(200).send({
            message: 'Product archived successfully',
            archiveProduct
        }))
        .catch(err => res.status(500).send({ error: "Error in Saving", details: err }));
};

// Activate product (admin)
module.exports.activateProduct = (req, res) => {
    let updateActiveField = { isActive: true };

    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
        .then(activateProduct => res.status(200).send({
            message: 'Product activated successfully',
            activateProduct
        }))
        .catch(err => res.status(500).send({ error: "Error in Saving", details: err }));
};

// Like/unlike product (user)
module.exports.likeProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const userId = req.user.id;
        const likeIndex = product.likes.indexOf(userId);

        if (likeIndex === -1) {
            product.likes.push(userId);
        } else {
            product.likes.splice(likeIndex, 1);
        }

        await product.save();
        res.status(200).send({
            likes: product.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (err) {
        console.error('Error liking product:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Delete product (admin)
module.exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send({ error: 'Internal server error' });
    }
};

// Unified Search: name/description, price filter, sort, priceOrder, nameOrder
// POST /products/search { query, minPrice, maxPrice, sortBy, priceOrder, nameOrder }
module.exports.searchProducts = async (req, res) => {
    try {
        const { 
            query = '', 
            minPrice = 0, 
            maxPrice = 100000, 
            sortBy = 'relevance', 
            priceOrder = 'asc', 
            nameOrder = 'asc' 
        } = req.body;

        const criteria = {
            isActive: true,
            price: { $gte: minPrice, $lte: maxPrice }
        };
        if (query && query.trim()) {
            const regex = new RegExp(query, "i");
            criteria.$or = [
                { name: regex },
                { description: regex }
            ];
        }

        let products = await Product.find(criteria).lean();

        // Sorting logic
        if (sortBy === 'popularity') {
            products.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        } else if (sortBy === 'price') {
            products.sort((a, b) => priceOrder === 'asc' ? a.price - b.price : b.price - a.price);
        } else if (sortBy === 'name') {
            products.sort((a, b) => {
                const nameA = (a.name || '').toLowerCase();
                const nameB = (b.name || '').toLowerCase();
                // Use numeric: true for correct number sorting
                const cmp = nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                return nameOrder === 'asc' ? cmp : -cmp;
            });
        }

        res.status(200).send({ products });
    } catch (err) {
        console.error("Error in unified search:", err);
        res.status(500).send({ error: "Internal Server Error", details: err?.message || err });
    }
};