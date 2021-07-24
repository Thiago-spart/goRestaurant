import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import { api } from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface FoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<FoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<FoodPlate>({} as FoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  const handleAddFood = async (
    food: Omit<FoodPlate, 'id' | 'available'>,
  ): Promise<void> => {
    try {
      const { name, description, image, price } = food;

      const response = await api.post('foods', {
        ...food,
        available: true,
      });

      setFoods(state => [...state, response.data]);
    } catch (err) {
      console.log(err); //editar isso
    }
  };

  const handleUpdateFood = async (
    food: Omit<FoodPlate, 'id' | 'available'>,
  ): Promise<void> => {
    const { name, description, price, image } = food;
    const { id } = editingFood;

    const response = await api.put(`foods/${id}`, {
      name,
      description,
      price,
      image,
    });

    try {
      setFoods(state => {
        return state.map(foodState => {
          if (foodState.id === id) {
            return { ...response.data };
          }

          return foodState;
        });
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteFood = async (id: number): Promise<void> => {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  };

  const toggleModal = (): void => {
    setModalOpen(!modalOpen);
  };

  const toggleEditModal = (): void => {
    setEditModalOpen(!editModalOpen);
  };

  const handleEditFood = (food: FoodPlate): void => {
    setEditingFood(food);
    setEditModalOpen(true);
  };

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
