import { StrictMode } from 'react';
import { Container } from '@mantine/core';

import { AppLayout } from '../src/layouts';

export default function Web(): JSX.Element {
  return (
    <StrictMode>
      <AppLayout title="The best dang lil' cookin' app on the internet">
        <Container size="xl">
          <p>
            Welcome to Dinner Done Better, your ultimate culinary companion for creating unforgettable meals! Say
            goodbye to the days of mundane cooking and hello to a world of delightful flavors and seamless meal
            planning. With our innovative application, preparing meals for your family will become an exciting adventure
            filled with creativity and harmony.
          </p>

          <p>
            Unleash your inner chef and customize recipes to your heart&apos;s content. Whether you&apos;re looking to
            add a dash of spice, substitute ingredients, or experiment with new flavors, Dinner Done Better empowers you
            to adapt any recipe to your liking. No more compromises or settling for less than perfect meals – now you
            can create dishes that truly reflect your unique taste and preferences.
          </p>

          <p>
            But it doesn&apos;t stop there! Meal planning has never been easier. With Dinner Done Better, you can
            effortlessly plan your meals for any length of time, be it a few days, a week, or even longer. Our intuitive
            interface allows you to organize your culinary journey, ensuring a well-balanced and varied menu for you and
            your loved ones. Gone are the days of last-minute meal decisions or repetitive dinners. Embrace the joy of
            anticipation as you plan exciting meals that will make everyone in your household eagerly gather around the
            table.
          </p>

          <p>
            We understand that coordinating meal choices with your family members can be a challenge. That&apos;s why
            Dinner Done Better brings everyone together with its unique collaborative features. Share your meal plans
            with other members of your household, get their input, and create a harmonious dining experience where
            everyone&apos;s preferences are taken into account. Say farewell to the age-old question, &quot;What&apos;s
            for dinner?&quot; and welcome a new era of culinary unity.
          </p>

          <p>
            And let&apos;s not forget the shopping experience! With Dinner Done Better, you&apos;ll breeze through your
            grocery list with ease. Our application generates comprehensive and optimized grocery lists for each meal
            plan, saving you time and ensuring you never forget a vital ingredient. No more aimless wandering through
            the supermarket aisles or realizing you&apos;ve left something crucial behind. We&apos;ve got you covered,
            making your trip to the grocery store a breeze.
          </p>

          <p>
            But that&apos;s not all – we go the extra mile to make your cooking experience truly seamless. Dinner Done
            Better provides detailed task prep lists for each meal plan, guiding you through every step of the cooking
            process. From chopping vegetables to marinating meats, our user-friendly instructions ensure that
            you&apos;re always in control. Effortlessly juggle multiple dishes, time your cooking to perfection, and
            revel in the satisfaction of a well-executed meal.
          </p>

          <p>
            So why wait? Join the Dinner Done Better community today and embark on a culinary adventure that will
            transform your cooking experiences and elevate your dining moments. With our application by your side,
            you&apos;ll not only become a kitchen maestro but also create unforgettable memories with your loved ones.
            Embrace the joy of cooking and savor every bite – your taste buds will thank you, and your family will never
            forget the magic you create in the kitchen. Start your flavorful journey today!
          </p>
        </Container>
      </AppLayout>
    </StrictMode>
  );
}
