# 
# Makefile for WordNet morphy
#

RELEASEDIR=	$(WNHOME/src/release
INSTALLDIR=	$(WNHOME)/bin
INCDIR=		$(WNHOME)/src/include
LIBDIR= 	$(WNHOME)/src/lib
WNLIBS=		$(LIBDIR)/libwn.a
LIBS=		-lwn

PROG=	morphy
SRC=	morphy.c
OBJ=	morphy.o
H=

CC=		gcc
CFLAGS=		-g
CPPFLAGS=	-I$(INCDIR)
LDFLAGS=	-L$(LIBDIR)

release:=	LDFLAGS += -static
release:=	CFLAGS=-O
install:=	CFLAGS=-O

all: $(PROG)

release: veryclean $(PROG)
	install -d $(RELEASEDIR)
	install $(PROG) $(RELEASEDIR)

install: veryclean $(PROG)
	install -m555 $(PROG) $(INSTALLDIR)

$(PROG): $(OBJ) $(WNLIBS)
	$(CC) -o $(PROG) $(LDFLAGS) $(OBJ) $(LIBS)

print:
	enscript -2Grh $(SRC) $(H)

clean:
	rm -f $(OBJ) core *~ #*

veryclean:
	$(MAKE) clean
	rm -f $(PROG)
