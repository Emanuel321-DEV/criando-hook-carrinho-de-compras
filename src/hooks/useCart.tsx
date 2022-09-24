import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart")

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productIsOnCart = cart.find(product => product.id === productId);

      const getStock = await api.get(`/stock/${productId}`);
      const stock = await getStock.data.amount;

      const stockIsInsuficient = productIsOnCart ? stock - (productIsOnCart.amount + 1) < 0 : stock.amount - 1 < 0;

      if (stockIsInsuficient) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const getProduct = await api.get(`products/${productId}`);
      const product = await getProduct.data;

      if (productIsOnCart) {

        const incrementProductInCart = cart.map(productItem => productItem.id === productId ? {
          ...productItem,
          amount: productItem.amount + 1
        } : productItem)

        setCart(incrementProductInCart);

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(incrementProductInCart));

      } else {

        Object.assign(product, {
          amount: 1
        })

        setCart([...cart, product])

        localStorage.setItem("@RocketShoes:cart", JSON.stringify([...cart, product]))

      }

    } catch {
      // TODO
      toast.error("Erro na adição do produto");

      return;
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productIsOnCart = cart.some(product => product.id === productId);

      if (productIsOnCart === false) {
        throw new Error();
      }

      const cartUpdated = cart.filter(productInCart => productInCart.id !== productId);

      setCart(cartUpdated);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cartUpdated));

    } catch {
      // TODO
      toast.error("Erro na remoção do produto");
      return;
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      const findProductInCart = cart.some(product => product.id === productId);

      if (!findProductInCart) {
        throw new Error();
      }

      if (amount < 1) {
        return;
      }

      const findStock = await api.get(`stock/${productId}`)
      const stock = findStock.data.amount;
      const stockIsInsuficient = stock - amount < 0;

      if (stockIsInsuficient) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const updateProductAmount = cart.map(productItem => (
        productItem.id === productId ? {
        ...productItem,
        amount,
      } : productItem));


      setCart(updateProductAmount);
      
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updateProductAmount));


    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
      return;
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
