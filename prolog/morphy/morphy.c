/*
   morphy.c - return base form for word in pos

*/

#include <stdio.h>
#include "wn.h"

static char *Id = "$Id: morphy.c,v 1.1 1997/09/04 19:51:33 wn Exp $";

main(int argc, char* argv[])
{
  int pos;
  char *bf;

  if (argc < 3) {
    fprintf(stderr, "Usage: morphy word (n | v | a | r)\n");
    exit(-1);
  }

  if (wninit()) {
    fprintf(stderr, "morphy: Fatal error - cannot open WordNet database\n");
    exit(-1);
  }

  switch(argv[2][0]) {
  case 'n':
    pos = NOUN;
    break;
  case 'v':
    pos = VERB;
    break;
  case 'a':
    pos = ADJ;
    break;
  case 'r':
    pos = ADV;
    break;
  }

  bf =  morphstr(argv[1], pos);
  printf("%s\n", bf ? bf : argv[1]);

  exit (0);
}

      
