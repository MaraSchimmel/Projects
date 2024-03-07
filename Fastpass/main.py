### Implementation of an M/M/1 queue using the discret-event advance strategy
#
# CMS 380

from math import log
from random import random
from random import randint
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# Priority queue operations
from heapq import heappush, heappop, heapify
def plot(x1_list,y1_list,y2_list,load):
  plt.figure()
  plt.plot(x1_list,y1_list,'ro',x1_list,y2_list,'bs')
  x1_list.sort()
  y1_list.sort()


  #Legend
  red_patch = mpatches.Patch(color='red',label='Normal')
  blue_patch = mpatches.Patch(color='blue',label='Fastpass')
  plt.legend(handles=[red_patch,blue_patch])

  #Make bounds
  #if y2_list[len(y2_list)-1] > y1_list[len(y1_list)-1]:
      #plt.axis([x1_list[0],x1_list[len_x - 1],y1_list[0],y2_list[len_y-1] + .01])
  #else:
    #plt.axis([x1_list[0],x1_list[len_x-1],y1_list[0],y1_list[len_y-1] + .01])


  #Create the title and labels
  if load == 'high':
    str_load = 'higher load (u = .95)'
  elif load == 'low':
    str_load = 'lower load (u = .50)'
  plt.title('Fastpass percentages vs residence times with '+ str_load)
  plt.xlabel('Fraction of fastpasses')
  plt.ylabel('Simulated Average Residence Time')
  if load == 'high':
    plt.savefig('fastpass_high.pdf')
  else:
    plt.savefig('fastpass_low.pdf')
  #plt.show()
def is_fast(f):
  """
  Determine if an arrival is a fastpass customer
  """
  i = random()
  if i < f:
    return 'fastpass'
  return 'regular'
def rand_exp(rate):

    """ Generate an exponential random variate

        input: rate, the parameter of the distribution
        returns: the exponential variate
    """

    return -log(random()) / rate


def simulate_f(arrival_rate,f):

    """ Simulate the M/M/1 queue, discrete-event style

        input: arrival_rate  the system's arrival rate
        returns: the average simulated residence time
    """

    # Stopping condition
    max_num_arrivals = 50000

    # Basic parameters
    service_rate = 1.0
    time = 0.0
    num_in_queue = 0
    fast_in_queue = 0

    # Simulation data lists
    arrival_times = []
    arrival_times_n = []
    arrival_times_f = []
    enter_service_times = []
    enter_service_times_n = []
    enter_service_times_f = []
    departure_times = []
    departure_times_n = []
    departure_times_f = []
    service_type = []

    # Initialize FEL as an empty list
    future_event_list = []

    # Make the first arrival event
    interarrival_time = rand_exp(arrival_rate)
    new_event = (time + interarrival_time, 'arrival',is_fast(f))

    # Insert with a heap operation
    heappush(future_event_list, new_event)

    while len(future_event_list) > 0 and len(arrival_times) < max_num_arrivals:

        # Pop the next event with a heap operation
        event = heappop(future_event_list)

        # Event attributes
        event_time = event[0]
        event_type = event[1]
        event_priority = event[2]

        # Advance simulated time
        time = event_time

        ### Process events

        # Arrivals
        if event_type == 'arrival':

            # Log arrival time
            arrival_times.append(time)
            if event_priority == 'regular':
              arrival_times_n.append(time)
            else:
              arrival_times_f.append(time)

            # Log customer type
            service_type.append(event_priority)

            # Increment queue size
            num_in_queue += 1
            if event_priority == 'fastpass':
              fast_in_queue += 1

            # Generate next arrival
            interarrival_time = rand_exp(arrival_rate)
            new_event = (time + interarrival_time, 'arrival',is_fast(f))
            heappush(future_event_list, new_event)

            # If queue was empty, enter service and generate a future departure event
            if num_in_queue == 1:

                # Log enter service time
                enter_service_times.append(time)
                if event_priority == 'fastpass':
                  enter_service_times_f.append(time)
                else:
                  enter_service_times_n.append(time)

                # Generate new departure event
                service_time = rand_exp(service_rate)
                new_event = (time + service_time, 'departure',event_priority)
                heappush(future_event_list, new_event)


        # Departure
        elif event_type == 'departure':

            # Log departure time
            departure_times.append(time)
            if event_priority == 'fastpass':
              departure_times_f.append(time)
            else:
              departure_times_n.append(time)

            # Decrement queue size
            #if fast_in_queue < 0:
              #print("fast_in_queue: %d < 0" % (fast_in_queue))
            num_in_queue -= 1
            if event_priority == 'fastpass':
              fast_in_queue -= 1

            # If there are more customers waiting, put the next one into service and generate a departure
            if num_in_queue > 0:
               # Log enter service time
                enter_service_times.append(time)
                if fast_in_queue > 0:
                  enter_service_times_f.append(time)
                  # Change next priority
                  event_priority = 'fastpass'
                else:
                  enter_service_times_n.append(time)
                  event_priority = 'regular'

                # Generate new departure event
                service_time = rand_exp(service_rate)
                new_event = (time + service_time, 'departure',event_priority)
                heappush(future_event_list, new_event)


    ### Simulation is over
    #
    # Calculate statistics

    # Average residence time
    residence_times = [departure_times[i] - arrival_times[i] for i in range(len(departure_times))]
    average_residence_time = sum(residence_times) / len(residence_times)

    # Average fastpass residence time
    #print("len(departure_times): %d\tlen(arrival_times_n): %d" % (len(departure_times),len(arrival_times)))
    #print("len(departure_times_n): %d\t len(arrival_times_n): %d" % (len(departure_times_n),len(arrival_times_n)))
    #print("len(departure_times_f): %d\t len(arrival_times_f): %d" % (len(departure_times_f),len(arrival_times_f)))
    #print("fast_in_queue: %d" % (fast_in_queue))
    residence_times_f = [departure_times_f[i] - arrival_times_f[i] for i in range(len(departure_times_f))]
    if len(residence_times_f) != 0:
      average_residence_time_f = sum(residence_times_f) / len(residence_times_f)
    else:
      average_residence_time_f = 0

    # Average normal residence time
    residence_times_n = [departure_times_n[i] - arrival_times_n[i] for i in range(len(departure_times_n))]
    average_residence_time_n = sum(residence_times_n) / len(residence_times_n)

    return average_residence_time, average_residence_time_f, average_residence_time_n




def simulate(arrival_rate):

    """ Simulate the M/M/1 queue, discrete-event style

        input: arrival_rate  the system's arrival rate
        returns: the average simulated residence time
    """

    # Stopping condition
    max_num_arrivals = 50000

    # Basic parameters
    service_rate = 1.0
    time = 0.0
    num_in_queue = 0

    # Simulation data lists
    arrival_times = []
    enter_service_times = []
    departure_times = []

    # Initialize FEL as an empty list
    future_event_list = []

    # Make the first arrival event
    interarrival_time = rand_exp(arrival_rate)
    new_event = (time + interarrival_time, 'arrival')

    # Insert with a heap operation
    heappush(future_event_list, new_event)

    while len(future_event_list) > 0 and len(arrival_times) < max_num_arrivals:

        # Pop the next event with a heap operation
        event = heappop(future_event_list)

        # Event attributes
        event_time = event[0]
        event_type = event[1]

        # Advance simulated time
        time = event_time

        ### Process events

        # Arrivals
        if event_type == 'arrival':

            # Log arrival time
            arrival_times.append(time)

            # Increment queue size
            num_in_queue += 1

            # Generate next arrival
            interarrival_time = rand_exp(arrival_rate)
            new_event = (time + interarrival_time, 'arrival')
            heappush(future_event_list, new_event)

            # If queue was empty, enter service and generate a future departure event
            if num_in_queue == 1:

                # Log enter service time
                enter_service_times.append(time)

                # Generate new departure event
                service_time = rand_exp(service_rate)
                new_event = (time + service_time, 'departure')
                heappush(future_event_list, new_event)


        # Departure
        elif event_type == 'departure':

            # Log departure time
            departure_times.append(time)

            # Decrement queue size
            num_in_queue -= 1

            # If there are more customers waiting, put the next one into service and generate a departure
            if num_in_queue > 0:

                # Log enter service time
                enter_service_times.append(time)

                # Generate new departure event
                service_time = rand_exp(service_rate)
                new_event = (time + service_time, 'departure')
                heappush(future_event_list, new_event)


    ### Simulation is over
    #
    # Calculate statistics

    # Average residence time
    residence_times = [departure_times[i] - arrival_times[i] for i in range(len(departure_times))]
    average_residence_time = sum(residence_times) / len(residence_times)

    return average_residence_time



def main():

    """ Simulate for different utilization levels """

    #f = .6
    #print("f: %f" % (f))
    u = 50
    print("u: %d" % (u))
    f_list = []
    avg_residence_times_f = []
    avg_residence_times_n = []
    for f in range(0, 100, 5):
        f_use = f/100.0
        f_list.append(f_use)
        # Run 20 trials at each utilization level and use the average of the simulated
        # values as the estimate of the residence time

        sim_residence_times = []
        sim_residence_times_normal = []
        sim_residence_times_fast = []
        org = u/100.0
        norm = (1-f_use) * u/100.0
        fast = f_use * u/100.0
        for trial in range(20):
            sim_res, sim_res_f, sim_res_n = simulate_f(org, f_use)
            #sim_residence_times.append(simulate(org))
            sim_residence_times.append(sim_res)
            sim_residence_times_fast.append(sim_res_f)
            sim_residence_times_normal.append(sim_res_n)
            #sim_residence_times_normal.append(simulate(norm))
            #if fast != 0:
              #sim_residence_times_fast.append(simulate(fast))
            #else:
              #sim_residence_times_fast.append(0)

        sim_r_avg = sum(sim_residence_times) / len(sim_residence_times)

        sim_r_n_avg = sum(sim_residence_times_normal) / len(sim_residence_times_normal)
        avg_residence_times_n.append(sim_r_n_avg)
        sim_r_f_avg = sum(sim_residence_times_fast) / len(sim_residence_times_fast)
        avg_residence_times_f.append(sim_r_f_avg)

        print('%d\torg: %f\tnorm: \t%f\tfast: \t%f' % (f, sim_r_avg,sim_r_n_avg,sim_r_f_avg))

        #print('f: %d\tnorm: \t%f\tfast: \t%f' % (f,sim_r_n_avg,sim_r_f_avg))

    plot(f_list,avg_residence_times_n,avg_residence_times_f,'low')
    u = 95
    print("u: %d" % (u))
    f_list = []
    avg_residence_times_f = []
    avg_residence_times_n = []
    for f in range(0, 100, 5):
        f_use = f/100.0
        f_list.append(f_use)
        # Run 20 trials at each utilization level and use the average of the simulated
        # values as the estimate of the residence time

        sim_residence_times = []
        sim_residence_times_normal = []
        sim_residence_times_fast = []
        org = u/100.0
        norm = (1-f_use) * u/100.0
        fast = f_use * u/100.0
        for trial in range(20):
            sim_res, sim_res_f, sim_res_n = simulate_f(org, f_use)
            #sim_residence_times.append(simulate(org))
            sim_residence_times.append(sim_res)
            sim_residence_times_fast.append(sim_res_f)
            sim_residence_times_normal.append(sim_res_n)
            #sim_residence_times_normal.append(simulate(norm))
            #if fast != 0:
              #sim_residence_times_fast.append(simulate(fast))
            #else:
              #sim_residence_times_fast.append(0)

        sim_r_avg = sum(sim_residence_times) / len(sim_residence_times)

        sim_r_n_avg = sum(sim_residence_times_normal) / len(sim_residence_times_normal)
        avg_residence_times_n.append(sim_r_n_avg)
        sim_r_f_avg = sum(sim_residence_times_fast) / len(sim_residence_times_fast)
        avg_residence_times_f.append(sim_r_f_avg)

        print('%d\torg: %f\tnorm: \t%f\tfast: \t%f' % (f, sim_r_avg,sim_r_n_avg,sim_r_f_avg))

        #print('f: %d\tnorm: \t%f\tfast: \t%f' % (f,sim_r_n_avg,sim_r_f_avg))


    plot(f_list,avg_residence_times_n,avg_residence_times_f,'high')

if __name__ == '__main__':
    main()
