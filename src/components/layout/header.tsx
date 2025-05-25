"use client";

import { Fragment, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  // MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { selectCartItemsCount } from "../../store/slices/cartSlice";

const navigation = {
  categories: [
    {
      id: "electronics",
      name: "Electronics",
      featured: [
        {
          name: "New Arrivals",
          href: "/products?category=electronics",
          imageSrc:
            "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          imageAlt: "Collection of the latest electronics and gadgets.",
        },
        {
          name: "Best Sellers",
          href: "/products",
          imageSrc:
            "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          imageAlt: "Our most popular electronics products and accessories.",
        },
      ],
      sections: [
        {
          id: "computers",
          name: "Computers",
          items: [
            { name: "Laptops", href: "/products?category=laptops" },
            { name: "Desktop PCs", href: "/products?category=desktops" },
            { name: "Monitors", href: "/products?category=monitors" },
            { name: "Keyboards", href: "/products?category=keyboards" },
            { name: "Mice", href: "/products?category=mice" },
            { name: "Printers", href: "/products?category=printers" },
            { name: "Computer Components", href: "/products?category=components" },
            { name: "Storage & Drives", href: "/products?category=storage" },
            { name: "Networking", href: "/products?category=networking" },
          ],
        },
        {
          id: "mobile",
          name: "Mobile Devices",
          items: [
            { name: "Smartphones", href: "/products?category=smartphones" },
            { name: "Tablets", href: "/products?category=tablets" },
            { name: "Smartwatches", href: "/products?category=smartwatches" },
            { name: "Phone Cases", href: "/products?category=phone-cases" },
            { name: "Screen Protectors", href: "/products?category=screen-protectors" },
            { name: "Power Banks", href: "/products?category=power-banks" },
          ],
        },
        {
          id: "brands",
          name: "Popular Brands",
          items: [
            { name: "Apple", href: "/products?brand=apple" },
            { name: "Samsung", href: "/products?brand=samsung" },
            { name: "Sony", href: "/products?brand=sony" },
            { name: "Dell", href: "/products?brand=dell" },
            { name: "HP", href: "/products?brand=hp" },
            { name: "Logitech", href: "/products?brand=logitech" },
          ],
        },
      ],
    },
    {
      id: "cameras",
      name: "Cameras",
      featured: [
        {
          name: "Featured Cameras",
          href: "/products?category=cameras",
          imageSrc:
            "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          imageAlt: "Professional and amateur cameras and photography equipment.",
        },
        {
          name: "Photography Essentials",
          href: "/products?category=camera-accessories",
          imageSrc:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          imageAlt: "Collection of camera accessories including lenses, tripods, and camera bags.",
        },
      ],
      sections: [
        {
          id: "cameras-types",
          name: "Camera Types",
          items: [
            { name: "DSLR Cameras", href: "/products?category=dslr" },
            { name: "Mirrorless Cameras", href: "/products?category=mirrorless" },
            { name: "Point & Shoot", href: "/products?category=point-and-shoot" },
            { name: "Action Cameras", href: "/products?category=action-cameras" },
            { name: "Drones", href: "/products?category=drones" },
            { name: "Film Cameras", href: "/products?category=film-cameras" },
            { name: "Browse All", href: "/products?category=cameras" },
          ],
        },
        {
          id: "accessories",
          name: "Camera Accessories",
          items: [
            { name: "Lenses", href: "/products?category=lenses" },
            { name: "Tripods", href: "/products?category=tripods" },
            { name: "Camera Bags", href: "/products?category=camera-bags" },
            { name: "Memory Cards", href: "/products?category=memory-cards" },
            { name: "Filters", href: "/products?category=filters" },
            { name: "Lighting", href: "/products?category=lighting" },
          ],
        },
        {
          id: "camera-brands",
          name: "Popular Camera Brands",
          items: [
            { name: "Canon", href: "/products?brand=canon" },
            { name: "Nikon", href: "/products?brand=nikon" },
            { name: "Sony", href: "/products?brand=sony" },
            { name: "Fujifilm", href: "/products?brand=fujifilm" },
            { name: "GoPro", href: "/products?brand=gopro" },
            { name: "DJI", href: "/products?brand=dji" },
          ],
        },
      ],
    },
    {
      id: "accessories",
      name: "Accessories",
      featured: [
        {
          name: "Featured Accessories",
          href: "/products?category=accessories",
          imageSrc:
            "https://images.unsplash.com/photo-1625961332771-3be6d2cbc49c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          imageAlt: "Collection of tech accessories and peripherals.",
        },
      ],
      sections: [
        {
          id: "audio",
          name: "Audio",
          items: [
            { name: "Headphones", href: "/products?category=headphones" },
            { name: "Earbuds", href: "/products?category=earbuds" },
            { name: "Bluetooth Speakers", href: "/products?category=bluetooth-speakers" },
            { name: "Microphones", href: "/products?category=microphones" },
            { name: "Home Audio", href: "/products?category=home-audio" },
            { name: "Car Audio", href: "/products?category=car-audio" },
          ],
        },
        {
          id: "peripherals",
          name: "Computer Peripherals",
          items: [
            { name: "External Hard Drives", href: "/products?category=external-drives" },
            { name: "USB Hubs", href: "/products?category=usb-hubs" },
            { name: "Webcams", href: "/products?category=webcams" },
            { name: "Cables & Adapters", href: "/products?category=cables" },
            { name: "Computer Accessories", href: "/products?category=computer-accessories" },
          ],
        },
      ],
    },
  ],
  // pages: [
  //   { name: "Deals", href: "/deals" },
  //   { name: "Support", href: "/support" },
  // ],
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const cartItemsCount = useAppSelector(selectCartItemsCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <Dialog open={open} onClose={setOpen} className="relative z-40 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
          >
            <div className="flex px-4 pt-5 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>

            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map(category => (
                    <Tab
                      key={category.name}
                      className="flex-1 border-b-2 border-transparent px-1 py-4 text-base font-medium whitespace-nowrap text-gray-900 data-selected:border-indigo-600 data-selected:text-indigo-600"
                    >
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map(category => (
                  <TabPanel key={category.name} className="space-y-10 px-4 pt-10 pb-8 z-50">
                    <div className="grid grid-cols-2 gap-x-4">
                      {category.featured.map(item => (
                        <div key={item.name} className="group relative text-sm">
                          <img
                            alt={item.imageAlt}
                            src={item.imageSrc}
                            className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                          />
                          <a href={item.href} className="mt-6 block font-medium text-gray-900">
                            <span aria-hidden="true" className="absolute inset-0 z-10" />
                            {item.name}
                          </a>
                          <p aria-hidden="true" className="mt-1">
                            Shop now
                          </p>
                        </div>
                      ))}
                    </div>
                    {category.sections.map(section => (
                      <div key={section.name}>
                        <p
                          id={`${category.id}-${section.id}-heading-mobile`}
                          className="font-medium text-gray-900"
                        >
                          {section.name}
                        </p>
                        <ul
                          role="list"
                          aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                          className="mt-6 flex flex-col space-y-6"
                        >
                          {section.items.map(item => (
                            <li key={item.name} className="flow-root">
                              <a href={item.href} className="-m-2 block p-2 text-gray-500">
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>

            <div className="space-y-6 border-t border-gray-200 px-4 py-6">
              {isAuthenticated ? (
                <>
                  <div className="flow-root">
                    <div className="-m-2 block p-2 font-medium text-gray-900">
                      Hello, {user?.name || "User"}
                    </div>
                  </div>
                  <div className="flow-root">
                    <Link to="/profile" className="-m-2 block p-2 font-medium text-gray-900">
                      My Account
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link to="/orders" className="-m-2 block p-2 font-medium text-gray-900">
                      My Orders
                    </Link>
                  </div>
                  <div className="flow-root">
                    <button
                      onClick={handleLogout}
                      className="-m-2 block p-2 font-medium text-gray-900"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flow-root">
                    <Link to="/signin" className="-m-2 block p-2 font-medium text-gray-900">
                      Sign in
                    </Link>
                  </div>
                  <div className="flow-root">
                    <Link to="/signup" className="-m-2 block p-2 font-medium text-gray-900">
                      Create account
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 px-4 py-6">
              <p className="mb-2 block text-base font-medium text-gray-900">Currency</p>
              <div className="flex flex-col space-y-3">
                <button className="-m-2 flex items-center p-2">
                  <img
                    alt="USD"
                    src="https://tailwindcss.com/plus-assets/img/flags/flag-united-states.svg"
                    className="block h-auto w-5 shrink-0"
                  />
                  <span className="ml-3 block text-base font-medium text-gray-900">USD</span>
                </button>
                <button className="-m-2 flex items-center p-2">
                  <img
                    alt="CAD"
                    src="https://tailwindcss.com/plus-assets/img/flags/flag-canada.svg"
                    className="block h-auto w-5 shrink-0"
                  />
                  <span className="ml-3 block text-base font-medium text-gray-500">CAD</span>
                </button>
                <button className="-m-2 flex items-center p-2">
                  <img
                    alt="EUR"
                    src="https://tailwindcss.com/plus-assets/img/flags/flag-european-union.svg"
                    className="block h-auto w-5 shrink-0"
                  />
                  <span className="ml-3 block text-base font-medium text-gray-500">EUR</span>
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <header className="relative bg-white z-40">
        {/* <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          Summer Sale! Get free delivery on orders over $100 + 10% off with code SUMMER10
        </p> */}

        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link to="/">
                  <span className="sr-only">TechElectronics</span>
                  <div className="flex items-center">
                    <img
                      alt=""
                      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                      className="h-8 w-auto"
                    />
                    <span className="ml-2 text-lg font-semibold text-indigo-600">
                      TechElectronics
                    </span>
                  </div>
                </Link>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map(category => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton className="relative z-10 -mb-px flex items-center border-b-2 border-transparent pt-px text-sm font-medium text-gray-700 transition-colors duration-200 ease-out hover:text-gray-800 data-open:border-indigo-600 data-open:text-indigo-600">
                          {category.name}
                        </PopoverButton>
                      </div>

                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in z-50"
                      >
                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 top-1/2 bg-white shadow-sm"
                        />

                        <div className="relative bg-white">
                          <div className="mx-auto max-w-7xl px-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                              <div className="col-start-2 grid grid-cols-2 gap-x-8">
                                {category.featured.map(item => (
                                  <div
                                    key={item.name}
                                    className="group relative text-base sm:text-sm"
                                  >
                                    <img
                                      alt={item.imageAlt}
                                      src={item.imageSrc}
                                      className="aspect-square w-full rounded-lg bg-gray-100 object-cover group-hover:opacity-75"
                                    />
                                    <a
                                      href={item.href}
                                      className="mt-6 block font-medium text-gray-900"
                                    >
                                      <span aria-hidden="true" className="absolute inset-0 z-10" />
                                      {item.name}
                                    </a>
                                    <p aria-hidden="true" className="mt-1">
                                      Shop now
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <div className="row-start-1 grid grid-cols-3 gap-x-8 gap-y-10 text-sm">
                                {category.sections.map(section => (
                                  <div key={section.name}>
                                    <p
                                      id={`${section.name}-heading`}
                                      className="font-medium text-gray-900"
                                    >
                                      {section.name}
                                    </p>
                                    <ul
                                      role="list"
                                      aria-labelledby={`${section.name}-heading`}
                                      className="mt-6 space-y-6 sm:mt-4 sm:space-y-4"
                                    >
                                      {section.items.map(item => (
                                        <li key={item.name} className="flex">
                                          <a href={item.href} className="hover:text-gray-800">
                                            {item.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverPanel>
                    </Popover>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  {isAuthenticated ? (
                    <div className="flex items-center">
                      <Popover className="relative">
                        <PopoverButton className="group flex items-center p-2 text-sm font-medium text-gray-700 hover:text-gray-800">
                          {user?.avatar?.url ? (
                            <img
                              src={user.avatar.url}
                              alt={user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon
                              className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />
                          )}
                          <span className="ml-2">{user?.name?.split(" ")[0] || "User"}</span>
                        </PopoverButton>
                        <PopoverPanel className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Your Profile
                          </Link>
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Orders
                          </Link>
                          {user?.role === "admin" && (
                            <>
                              <Link
                                to="/admin/products"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Admin Products
                              </Link>
                              <Link
                                to="/admin/orders"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Admin Orders
                              </Link>
                            </>
                          )}
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Sign out
                          </button>
                        </PopoverPanel>
                      </Popover>
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/signin"
                        className="text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Sign in
                      </Link>
                      <span aria-hidden="true" className="h-6 w-px bg-gray-200" />
                      <Link
                        to="/signup"
                        className="text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>

                {/* Search */}
                {/* <div className="flex lg:ml-6">
                  <a href="#" className="p-2 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon aria-hidden="true" className="size-6" />
                  </a>
                </div> */}

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <Link to="/cart" className="group -m-2 flex items-center p-2">
                    <ShoppingBagIcon
                      aria-hidden="true"
                      className="size-6 shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                      {cartItemsCount}
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
