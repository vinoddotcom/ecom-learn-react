import React, { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductService from "../../api/productService";
import { useAppSelector } from "../../store/hooks";

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const isEditing = Boolean(id);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    price: number;
    description: string;
    category: string;
    Stock: number;
  }>({
    name: "",
    price: 0,
    description: "",
    category: "",
    Stock: 0,
  });

  // File upload state
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{ public_id: string; url: string }[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingProduct, setFetchingProduct] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Available categories (typically would come from API)
  const categories = [
    "Electronics",
    "Cameras",
    "Laptops",
    "Accessories",
    "Headphones",
    "Food",
    "Books",
    "Clothes",
    "Shoes",
    "Beauty",
    "Sports",
    "Outdoor",
    "Home",
  ];

  // Fetch product details if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchProductDetails = async () => {
        try {
          setFetchingProduct(true);
          const response = await ProductService.getProductById(id);

          if (response.product) {
            const product = response.product;
            setFormData({
              name: product.name,
              price: product.price,
              description: product.description,
              category: product.category,
              Stock: product.Stock,
            });

            if (product.images) {
              setExistingImages(product.images);
            }
          }

          setFetchingProduct(false);
        } catch {
          setError("Failed to fetch product details");
          setFetchingProduct(false);
        }
      };

      fetchProductDetails();
    }
  }, [id, isEditing]);

  // Handle access control
  if (!user || user.role !== "admin") {
    return (
      <div className="text-center p-8">
        <h1 className="text-xl font-semibold text-red-500">Access Denied</h1>
        <p className="mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "price" || name === "stock" ? parseFloat(value) : value,
    });
  };

  // Handle image upload
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Instead of clearing previous images, add the new ones
    files.forEach(file => {
      // Add to files array
      setImages(prev => [...prev, file]);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagesPreviews(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Clear the input value so the same files can be selected again if needed
    if (e.target.value) {
      e.target.value = "";
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle removing an existing image
  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData object for multipart/form-data
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("price", formData.price.toString());
      productData.append("description", formData.description);
      productData.append("category", formData.category);
      productData.append("stock", formData.Stock.toString());

      // Append images
      images.forEach(image => {
        productData.append("images", image);
      });

      // Append existing images that haven't been removed
      if (isEditing) {
        const remainingImages = JSON.stringify(existingImages);
        productData.append("existingImages", remainingImages);
      }

      // Send request
      if (isEditing && id) {
        await ProductService.updateProduct(id, productData);
        setSuccess("Product updated successfully");
      } else {
        await ProductService.createProduct(productData);
        setSuccess("Product created successfully");
      }

      // Redirect to products list after a delay
      // setTimeout(() => {
      //   navigate("/admin/products");
      // }, 1500);
    } catch {
      setError(isEditing ? "Failed to update product" : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div
          role="status"
          className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? "Edit Product" : "Add New Product"}</h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          role="alert"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Enter product name"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Enter price"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Enter product description"
          ></textarea>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="Stock" className="block text-sm font-medium text-gray-700">
            Stock
          </label>
          <input
            type="number"
            id="Stock"
            name="Stock"
            value={formData.Stock}
            onChange={handleInputChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Enter available stock"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Images</label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            You can upload multiple images. Max 5 images recommended.
          </p>

          {/* Image previews */}
          {imagesPreviews.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">New Images Preview:</h3>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {imagesPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing images (for edit mode) */}
          {existingImages.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700">Current Images:</h3>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.url}
                      alt={`Product image ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : isEditing ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>

      {/* Cancel button */}
      <div className="mt-4">
        <button
          onClick={() => navigate("/admin/products")}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AdminProductForm;
