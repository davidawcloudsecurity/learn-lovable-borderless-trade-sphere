import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ShoppingCart, Package, X, Phone, Mail, MessageCircle, Store } from 'lucide-react';

const S3_BUCKET_URL = '';
const S3_IMAGES_PATH = '/assets/images/';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  country: string;
  flag: string;
  rating: number;
  reviews: number;
  shipping: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  originalPrice,
  image,
  country,
  flag,
  rating,
  reviews,
  shipping
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 group">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={`${S3_BUCKET_URL}${S3_IMAGES_PATH}${image}`}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {originalPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </div>
        )}
        <div className="absolute top-2 right-2 flex items-center bg-white/90 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-lg mr-1">{flag}</span>
          <span className="text-xs font-medium text-gray-600">{country}</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer">
          {name}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(rating) ? "★" : "☆"}>★</span>
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">({reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">${price}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">${originalPrice}</span>
            )}
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Package className="h-4 w-4 mr-1" />
          <span>{shipping}</span>
        </div>

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <DialogHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-orange-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Let's Complete Your Order!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Product Summary */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3">
                <img
                  src={`${S3_BUCKET_URL}${S3_IMAGES_PATH}${image}`}
                  alt={name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{name}</h4>
                  <p className="text-blue-600 font-bold">${price}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-700 mb-4 leading-relaxed">
                Online ordering is temporarily unavailable. Our team is ready to help you complete your purchase through our direct channels.
              </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                className="w-full h-12 justify-start space-x-3 hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={() => window.open('tel:+1234567890', '_self')}
              >
                <Phone className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Call Us</div>
                  <div className="text-sm text-gray-600">+1 (234) 567-8900</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-12 justify-start space-x-3 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => window.open('mailto:orders@example.com', '_self')}
              >
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Email Us</div>
                  <div className="text-sm text-gray-600">orders@example.com</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full h-12 justify-start space-x-3 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                onClick={() => window.open('https://wa.me/1234567890', '_blank')}
              >
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">WhatsApp</div>
                  <div className="text-sm text-gray-600">Quick messaging</div>
                </div>
              </Button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-amber-400 rounded-full flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Why contact us directly?</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Personalized service and product recommendations</li>
                    <li>• Flexible payment and shipping options</li>
                    <li>• Immediate order confirmation and tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={() => setIsDialogOpen(false)} 
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={() => window.open('tel:+1234567890', '_self')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Call Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCard;
